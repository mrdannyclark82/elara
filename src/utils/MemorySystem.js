/**
 * Memory System
 * Advanced memory capabilities for remembering user details, preferences,
 * past conversations, and shared information indefinitely
 */

export class MemorySystem {
    constructor() {
        this.storageKey = 'elara_memory';
        this.memory = {
            user: {},
            preferences: {},
            conversations: [],
            facts: [],
            context: {},
            sessions: []
        };
        this.isEnabled = true;
        this.maxConversations = 1000;
        this.maxFacts = 500;
    }

    /**
     * Initialize memory system
     */
    async init() {
        console.log('💾 Initializing Memory System...');
        this.loadFromStorage();
        console.log('✅ Memory System initialized');
    }

    /**
     * Load memory from persistent storage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.memory = { ...this.memory, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load memory from storage:', error);
        }
    }

    /**
     * Save memory to persistent storage
     */
    saveToStorage() {
        if (!this.isEnabled) return;

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
        } catch (error) {
            console.warn('Failed to save memory to storage:', error);
            // Try to free up space by removing old conversations
            this.pruneOldData();
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
            } catch (retryError) {
                console.error('Memory storage full', retryError);
            }
        }
    }

    /**
     * Enable or disable memory
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            // Clear memory when disabled
            this.clear();
        }
    }

    /**
     * Store a value
     */
    set(key, value) {
        this.memory.user[key] = {
            value,
            timestamp: Date.now()
        };
        this.saveToStorage();
    }

    /**
     * Get a stored value
     */
    get(key) {
        return this.memory.user[key]?.value;
    }

    /**
     * Store a user preference
     */
    setPreference(key, value) {
        this.memory.preferences[key] = {
            value,
            timestamp: Date.now()
        };
        this.saveToStorage();
    }

    /**
     * Get a user preference
     */
    getPreference(key) {
        return this.memory.preferences[key]?.value;
    }

    /**
     * Add a conversation entry
     */
    addConversation(entry) {
        this.memory.conversations.push({
            ...entry,
            id: this.generateId(),
            timestamp: entry.timestamp || Date.now()
        });

        // Extract facts from conversation
        this.extractFacts(entry.content, entry.role);

        // Prune if needed
        if (this.memory.conversations.length > this.maxConversations) {
            this.memory.conversations = this.memory.conversations.slice(-this.maxConversations);
        }

        this.saveToStorage();
    }

    /**
     * Get conversation history
     */
    getConversations(limit = 50) {
        return this.memory.conversations.slice(-limit);
    }

    /**
     * Extract facts from text
     */
    extractFacts(text, role) {
        if (role !== 'user') return;

        // Simple fact extraction patterns
        const patterns = [
            // "My name is X"
            { regex: /my name is (\w+)/i, type: 'name', extract: 1 },
            // "I am X years old"
            { regex: /i (?:am|'m) (\d+) years? old/i, type: 'age', extract: 1 },
            // "I work as/at X"
            { regex: /i work (?:as|at) (.+?)(?:\.|,|$)/i, type: 'occupation', extract: 1 },
            // "I like/love X"
            { regex: /i (?:like|love|enjoy) (.+?)(?:\.|,|$)/i, type: 'interest', extract: 1 },
            // "I'm from X" / "I live in X"
            { regex: /i(?:'m| am) from (.+?)(?:\.|,|$)/i, type: 'location', extract: 1 },
            { regex: /i live in (.+?)(?:\.|,|$)/i, type: 'location', extract: 1 },
            // "My favorite X is Y"
            { regex: /my favorite (\w+) is (.+?)(?:\.|,|$)/i, type: 'favorite', extract: [1, 2] },
            // "I prefer X"
            { regex: /i prefer (.+?)(?:\.|,|$)/i, type: 'preference', extract: 1 }
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                let value;
                if (Array.isArray(pattern.extract)) {
                    value = pattern.extract.map(i => match[i]).join(': ');
                } else {
                    value = match[pattern.extract];
                }

                this.addFact({
                    type: pattern.type,
                    value: value.trim(),
                    source: text.substring(0, 100),
                    confidence: 0.8
                });
            }
        }
    }

    /**
     * Add a fact to memory
     */
    addFact(fact) {
        // Check for duplicate facts
        const existing = this.memory.facts.find(
            f => f.type === fact.type && f.value.toLowerCase() === fact.value.toLowerCase()
        );

        if (existing) {
            // Update confidence and timestamp
            existing.confidence = Math.min(1, existing.confidence + 0.1);
            existing.lastSeen = Date.now();
        } else {
            this.memory.facts.push({
                ...fact,
                id: this.generateId(),
                timestamp: Date.now(),
                lastSeen: Date.now()
            });
        }

        // Also store as user data for quick access
        if (fact.type === 'name') {
            this.set('user_name', fact.value);
        }

        // Prune old facts
        if (this.memory.facts.length > this.maxFacts) {
            // Keep most confident and recent facts
            this.memory.facts.sort((a, b) => {
                const scoreA = a.confidence * 0.5 + (a.lastSeen / Date.now()) * 0.5;
                const scoreB = b.confidence * 0.5 + (b.lastSeen / Date.now()) * 0.5;
                return scoreB - scoreA;
            });
            this.memory.facts = this.memory.facts.slice(0, this.maxFacts);
        }

        this.saveToStorage();
    }

    /**
     * Get facts by type
     */
    getFacts(type = null) {
        if (type) {
            return this.memory.facts.filter(f => f.type === type);
        }
        return this.memory.facts;
    }

    /**
     * Get relevant context for a query
     */
    getRelevantContext(query) {
        const context = {
            user: {},
            recentConversations: [],
            relevantFacts: []
        };

        // Get user basics
        context.user.name = this.get('user_name');
        context.user.preferences = this.memory.preferences;

        // Get recent conversations
        context.recentConversations = this.getConversations(10);

        // Find relevant facts based on query keywords
        const queryWords = query.toLowerCase().split(/\s+/);
        context.relevantFacts = this.memory.facts.filter(fact => {
            const factText = `${fact.type} ${fact.value}`.toLowerCase();
            return queryWords.some(word => 
                word.length > 3 && factText.includes(word)
            );
        });

        return context;
    }

    /**
     * Search memory for relevant information
     */
    search(query, options = {}) {
        const results = {
            conversations: [],
            facts: [],
            preferences: []
        };

        const queryLower = query.toLowerCase();
        const words = queryLower.split(/\s+/).filter(w => w.length > 2);

        // Search conversations
        if (options.includeConversations !== false) {
            results.conversations = this.memory.conversations.filter(conv => {
                const content = conv.content.toLowerCase();
                return words.some(word => content.includes(word));
            }).slice(-20);
        }

        // Search facts
        if (options.includeFacts !== false) {
            results.facts = this.memory.facts.filter(fact => {
                const text = `${fact.type} ${fact.value}`.toLowerCase();
                return words.some(word => text.includes(word));
            });
        }

        // Search preferences
        if (options.includePreferences !== false) {
            for (const [key, data] of Object.entries(this.memory.preferences)) {
                const text = `${key} ${JSON.stringify(data.value)}`.toLowerCase();
                if (words.some(word => text.includes(word))) {
                    results.preferences.push({ key, ...data });
                }
            }
        }

        return results;
    }

    /**
     * Get memory statistics
     */
    getStats() {
        return {
            conversations: this.memory.conversations.length,
            facts: this.memory.facts.length,
            preferences: Object.keys(this.memory.preferences).length,
            storageUsed: this.getStorageUsage()
        };
    }

    /**
     * Get storage usage in bytes
     */
    getStorageUsage() {
        try {
            return JSON.stringify(this.memory).length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Start a new session
     */
    startSession() {
        const session = {
            id: this.generateId(),
            startTime: Date.now(),
            interactions: 0
        };
        this.memory.sessions.push(session);
        this.memory.context.currentSession = session.id;
        this.saveToStorage();
        return session;
    }

    /**
     * Update current session
     */
    updateSession(data) {
        const sessionId = this.memory.context.currentSession;
        const session = this.memory.sessions.find(s => s.id === sessionId);
        if (session) {
            Object.assign(session, data, { lastUpdate: Date.now() });
            this.saveToStorage();
        }
    }

    /**
     * Prune old data to free up space
     */
    pruneOldData() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        // Remove old conversations
        this.memory.conversations = this.memory.conversations.filter(
            conv => conv.timestamp > thirtyDaysAgo
        );

        // Remove old, low-confidence facts
        this.memory.facts = this.memory.facts.filter(
            fact => fact.lastSeen > thirtyDaysAgo || fact.confidence > 0.5
        );

        // Keep only last 10 sessions
        this.memory.sessions = this.memory.sessions.slice(-10);
    }

    /**
     * Clear specific memory type
     */
    clearType(type) {
        switch (type) {
            case 'conversations':
                this.memory.conversations = [];
                break;
            case 'facts':
                this.memory.facts = [];
                break;
            case 'preferences':
                this.memory.preferences = {};
                break;
            case 'user':
                this.memory.user = {};
                break;
        }
        this.saveToStorage();
    }

    /**
     * Clear all memory
     */
    clear() {
        this.memory = {
            user: {},
            preferences: {},
            conversations: [],
            facts: [],
            context: {},
            sessions: []
        };
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Export memory data
     */
    export() {
        return JSON.stringify(this.memory, null, 2);
    }

    /**
     * Import memory data
     */
    import(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            this.memory = { ...this.memory, ...parsed };
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Failed to import memory:', error);
            return false;
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
