/**
 * Adaptive Persona System
 * Evolves based on user feedback and interaction patterns
 */

export class AdaptivePersona {
    constructor(memorySystem) {
        this.memory = memorySystem;
        this.currentPersona = 'professional';
        this.personaHistory = [];
        this.userPreferences = {};
        this.moodIndicators = [];
        this.adaptationRate = 0.1;
    }

    /**
     * Initialize persona system
     */
    async init() {
        console.log('🎭 Initializing Adaptive Persona...');
        
        // Load saved persona state
        const savedPersona = this.memory?.get?.('persona');
        if (savedPersona) {
            this.currentPersona = savedPersona;
        }

        const savedPreferences = this.memory?.get?.('persona_preferences');
        if (savedPreferences) {
            this.userPreferences = savedPreferences;
        }

        console.log(`✅ Persona initialized: ${this.currentPersona}`);
    }

    /**
     * Available personas with their characteristics
     */
    static PERSONAS = {
        professional: {
            name: 'Professional',
            description: 'Formal, focused, efficient communication',
            traits: {
                formality: 0.8,
                humor: 0.2,
                empathy: 0.5,
                enthusiasm: 0.4,
                verbosity: 0.5
            },
            greetings: [
                "Good day. How may I assist you?",
                "Hello. What can I help you with today?",
                "Greetings. I'm ready to assist."
            ],
            responses: {
                acknowledgment: "I understand.",
                thinking: "Let me analyze that.",
                success: "Task completed successfully.",
                error: "I apologize for the inconvenience."
            }
        },
        casual: {
            name: 'Casual',
            description: 'Relaxed, friendly, conversational style',
            traits: {
                formality: 0.3,
                humor: 0.6,
                empathy: 0.6,
                enthusiasm: 0.7,
                verbosity: 0.6
            },
            greetings: [
                "Hey there! What's up?",
                "Hi! How can I help you out?",
                "Hey! What can I do for you?"
            ],
            responses: {
                acknowledgment: "Got it!",
                thinking: "Hmm, let me think about that...",
                success: "Done! 🎉",
                error: "Oops, something went wrong."
            }
        },
        empathetic: {
            name: 'Empathetic',
            description: 'Warm, understanding, supportive tone',
            traits: {
                formality: 0.5,
                humor: 0.3,
                empathy: 0.95,
                enthusiasm: 0.5,
                verbosity: 0.7
            },
            greetings: [
                "Hello, it's so nice to hear from you.",
                "Hi there. I'm here for you.",
                "Welcome. How are you feeling today?"
            ],
            responses: {
                acknowledgment: "I hear you, and I understand.",
                thinking: "I'm carefully considering what you've shared.",
                success: "I'm glad I could help with that.",
                error: "I'm sorry things didn't work out as expected. Let's try another approach."
            }
        },
        motivational: {
            name: 'Motivational',
            description: 'Encouraging, inspiring, positive energy',
            traits: {
                formality: 0.4,
                humor: 0.4,
                empathy: 0.6,
                enthusiasm: 0.95,
                verbosity: 0.6
            },
            greetings: [
                "Great to see you! Ready to achieve something amazing?",
                "Hello, champion! What goals are we tackling today?",
                "Hey there, superstar! Let's make things happen!"
            ],
            responses: {
                acknowledgment: "Absolutely! Let's do this!",
                thinking: "What an interesting challenge! Let me work on that.",
                success: "Fantastic! You're crushing it!",
                error: "No worries! Every setback is a setup for a comeback!"
            }
        },
        humorous: {
            name: 'Humorous',
            description: 'Witty, playful, light-hearted approach',
            traits: {
                formality: 0.2,
                humor: 0.95,
                empathy: 0.5,
                enthusiasm: 0.7,
                verbosity: 0.5
            },
            greetings: [
                "Well, well, well... look who decided to chat! 😄",
                "Ahoy! Your friendly AI at your service! 🎩",
                "Hey! Ready for some fun problem-solving?"
            ],
            responses: {
                acknowledgment: "Roger that! 🫡",
                thinking: "Hmm, let me put on my thinking cap... 🎩",
                success: "Ta-da! Magic! ✨",
                error: "Houston, we have a problem... but I'll fix it!"
            }
        }
    };

    /**
     * Set persona directly
     */
    setPersona(personaName) {
        if (AdaptivePersona.PERSONAS[personaName]) {
            this.currentPersona = personaName;
            this.personaHistory.push({
                persona: personaName,
                timestamp: Date.now(),
                trigger: 'manual'
            });
            this.memory?.set?.('persona', personaName);
        }
    }

    /**
     * Get current persona name
     */
    getCurrentPersona() {
        return this.currentPersona;
    }

    /**
     * Get current persona configuration
     */
    getPersonaConfig() {
        return AdaptivePersona.PERSONAS[this.currentPersona];
    }

    /**
     * Analyze user input to detect mood and preferences
     */
    analyzeInput(text) {
        const analysis = {
            sentiment: this.detectSentiment(text),
            formality: this.detectFormality(text),
            urgency: this.detectUrgency(text),
            keywords: this.extractKeywords(text)
        };

        this.moodIndicators.push({
            ...analysis,
            timestamp: Date.now()
        });

        // Keep only recent indicators
        if (this.moodIndicators.length > 20) {
            this.moodIndicators = this.moodIndicators.slice(-20);
        }

        // Adapt persona based on patterns
        this.adaptToPatterns();

        return analysis;
    }

    /**
     * Detect sentiment in text
     */
    detectSentiment(text) {
        const positiveWords = ['thank', 'great', 'awesome', 'love', 'happy', 'excited', 'wonderful', 'fantastic', 'excellent', 'good', 'nice', 'amazing'];
        const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'frustrated', 'angry', 'upset', 'annoyed', 'disappointed', 'sad', 'worried'];
        const neutralWords = ['okay', 'fine', 'alright', 'sure'];

        const lowerText = text.toLowerCase();
        
        let positiveScore = 0;
        let negativeScore = 0;

        positiveWords.forEach(word => {
            if (lowerText.includes(word)) positiveScore++;
        });

        negativeWords.forEach(word => {
            if (lowerText.includes(word)) negativeScore++;
        });

        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    }

    /**
     * Detect formality level in text
     */
    detectFormality(text) {
        const formalIndicators = ['please', 'kindly', 'would you', 'could you', 'i would like', 'thank you', 'regards'];
        const casualIndicators = ['hey', 'yo', 'sup', 'gonna', 'wanna', 'lol', 'haha', '!', 'btw', 'omg'];

        const lowerText = text.toLowerCase();
        
        let formalScore = 0;
        let casualScore = 0;

        formalIndicators.forEach(indicator => {
            if (lowerText.includes(indicator)) formalScore++;
        });

        casualIndicators.forEach(indicator => {
            if (lowerText.includes(indicator)) casualScore++;
        });

        if (formalScore > casualScore) return 'formal';
        if (casualScore > formalScore) return 'casual';
        return 'neutral';
    }

    /**
     * Detect urgency in text
     */
    detectUrgency(text) {
        const urgentIndicators = ['urgent', 'asap', 'immediately', 'right now', 'emergency', 'critical', 'hurry', 'quick', 'fast'];
        const lowerText = text.toLowerCase();

        for (const indicator of urgentIndicators) {
            if (lowerText.includes(indicator)) return 'high';
        }

        // Multiple exclamation marks indicate urgency
        if ((text.match(/!/g) || []).length >= 2) return 'high';

        return 'normal';
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am'];

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        return [...new Set(words)];
    }

    /**
     * Adapt persona based on observed patterns
     */
    adaptToPatterns() {
        if (this.moodIndicators.length < 5) return;

        // Analyze recent patterns
        const recent = this.moodIndicators.slice(-10);
        
        const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
        const formalityCounts = { formal: 0, casual: 0, neutral: 0 };
        
        recent.forEach(indicator => {
            sentimentCounts[indicator.sentiment]++;
            formalityCounts[indicator.formality]++;
        });

        // Suggest persona changes based on patterns
        let suggestedPersona = this.currentPersona;

        // If user is consistently negative, switch to empathetic
        if (sentimentCounts.negative >= 3) {
            suggestedPersona = 'empathetic';
        }
        // If user is consistently positive and casual, switch to casual or humorous
        else if (sentimentCounts.positive >= 5 && formalityCounts.casual >= 3) {
            suggestedPersona = Math.random() > 0.5 ? 'casual' : 'humorous';
        }
        // If user is consistently formal, maintain professional
        else if (formalityCounts.formal >= 5) {
            suggestedPersona = 'professional';
        }
        // If user seems motivated, boost motivation
        else if (sentimentCounts.positive >= 4) {
            suggestedPersona = 'motivational';
        }

        // Only change if different and we have enough data
        if (suggestedPersona !== this.currentPersona && recent.length >= 8) {
            this.setPersona(suggestedPersona);
            console.log(`🎭 Persona adapted to: ${suggestedPersona}`);
        }
    }

    /**
     * Get a response in the current persona's style
     */
    getStyledResponse(responseType, customMessage = null) {
        const config = this.getPersonaConfig();
        const response = config.responses[responseType] || customMessage || '';
        return this.applyPersonaStyle(response);
    }

    /**
     * Apply persona styling to a message
     */
    applyPersonaStyle(message) {
        const config = this.getPersonaConfig();
        const traits = config.traits;

        let styled = message;

        // Add enthusiasm based on trait
        if (traits.enthusiasm > 0.7) {
            if (!styled.endsWith('!') && !styled.endsWith('?')) {
                styled += '!';
            }
        }

        return styled;
    }

    /**
     * Get a random greeting for current persona
     */
    getGreeting() {
        const config = this.getPersonaConfig();
        const greetings = config.greetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    /**
     * Record user feedback for adaptation
     */
    recordFeedback(type, value) {
        this.userPreferences[type] = value;
        this.memory?.set?.('persona_preferences', this.userPreferences);
    }

    /**
     * Get persona suggestions based on context
     */
    suggestPersona(context) {
        if (context.includes('help') || context.includes('support')) {
            return 'empathetic';
        }
        if (context.includes('code') || context.includes('work')) {
            return 'professional';
        }
        if (context.includes('fun') || context.includes('joke')) {
            return 'humorous';
        }
        return this.currentPersona;
    }

    /**
     * Reset to default persona
     */
    reset() {
        this.currentPersona = 'professional';
        this.moodIndicators = [];
        this.memory?.set?.('persona', 'professional');
    }
}
