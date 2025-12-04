/**
 * Elara - AI Virtual Assistant
 * Main Application Entry Point
 */

import { AvatarSystem } from './avatar/AvatarSystem.js';
import { AnimationController } from './animations/AnimationController.js';
import { LipSyncEngine } from './animations/LipSyncEngine.js';
import { GestureSystem } from './animations/GestureSystem.js';
import { FacialExpressionSystem } from './animations/FacialExpressionSystem.js';
import { MemorySystem } from './utils/MemorySystem.js';
import { AdaptivePersona } from './utils/AdaptivePersona.js';
import { SelfDevelopment } from './utils/SelfDevelopment.js';
import { GoogleIntegration } from './utils/GoogleIntegration.js';
import { GrokIntegration } from './utils/GrokIntegration.js';
import { YouTubePlayer } from './utils/YouTubePlayer.js';
import { CodingAssistant } from './utils/CodingAssistant.js';

/**
 * Main Elara Application Class
 */
class ElaraApp {
    constructor() {
        this.initialized = false;
        this.systems = {};
        this.conversationHistory = [];
    }

    /**
     * Initialize all Elara systems
     */
    async init() {
        console.log('🌟 Initializing Elara...');

        try {
            // Initialize Memory System first (other systems may depend on it)
            this.systems.memory = new MemorySystem();
            await this.systems.memory.init();

            // Initialize Adaptive Persona
            this.systems.persona = new AdaptivePersona(this.systems.memory);
            await this.systems.persona.init();

            // Initialize 3D Avatar System
            const canvas = document.getElementById('avatar-canvas');
            this.systems.avatar = new AvatarSystem(canvas);
            await this.systems.avatar.init();

            // Initialize Animation Systems
            this.systems.animation = new AnimationController(this.systems.avatar);
            this.systems.lipSync = new LipSyncEngine(this.systems.avatar);
            this.systems.gestures = new GestureSystem(this.systems.avatar);
            this.systems.expressions = new FacialExpressionSystem(this.systems.avatar);

            // Initialize Integration Services
            this.systems.google = new GoogleIntegration();
            this.systems.grok = new GrokIntegration();

            // Initialize YouTube PiP Player
            this.systems.youtube = new YouTubePlayer();

            // Initialize Coding Assistant
            this.systems.codingAssistant = new CodingAssistant();

            // Initialize Self-Development System
            this.systems.selfDev = new SelfDevelopment(this.systems);

            // Setup UI Event Listeners
            this.setupEventListeners();

            // Start Animation Loop
            this.startAnimationLoop();

            // Load saved state
            await this.loadState();

            this.initialized = true;
            this.updateStatus('Elara is ready', 'ready');
            console.log('✅ Elara initialized successfully!');

            // Welcome message
            this.displayWelcome();

        } catch (error) {
            console.error('❌ Failed to initialize Elara:', error);
            this.updateStatus('Initialization failed', 'error');
        }
    }

    /**
     * Setup all UI event listeners
     */
    setupEventListeners() {
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const voiceBtn = document.getElementById('voice-btn');

        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage(chatInput.value);
                chatInput.value = '';
            }
        });

        sendBtn?.addEventListener('click', () => {
            this.handleUserMessage(chatInput.value);
            chatInput.value = '';
        });

        voiceBtn?.addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Quick Action Buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Integration Items
        document.querySelectorAll('.integration-item').forEach(item => {
            item.addEventListener('click', () => {
                const service = item.dataset.service;
                this.handleIntegrationClick(service);
            });
        });

        // PiP Player Controls
        const pipClose = document.getElementById('pip-close');
        const pipMinimize = document.getElementById('pip-minimize');
        const pipPlayBtn = document.getElementById('pip-play-btn');

        pipClose?.addEventListener('click', () => this.systems.youtube.hide());
        pipMinimize?.addEventListener('click', () => this.systems.youtube.minimize());
        pipPlayBtn?.addEventListener('click', () => {
            const url = document.getElementById('pip-url-input')?.value;
            if (url) this.systems.youtube.play(url);
        });

        // Settings Modal
        const modalClose = document.querySelector('.modal-close');
        modalClose?.addEventListener('click', () => {
            document.getElementById('settings-modal')?.classList.add('hidden');
        });

        // Persona Selection
        const personaSelect = document.getElementById('persona-select');
        personaSelect?.addEventListener('change', (e) => {
            this.systems.persona.setPersona(e.target.value);
        });

        // Memory Toggle
        const memoryToggle = document.getElementById('memory-enabled');
        memoryToggle?.addEventListener('change', (e) => {
            this.systems.memory.setEnabled(e.target.checked);
        });
    }

    /**
     * Handle user message input
     */
    async handleUserMessage(message) {
        if (!message?.trim()) return;

        // Display user message
        this.addMessage(message, 'user');

        // Update avatar state - show listening/thinking
        this.systems.expressions.setExpression('thinking');
        this.systems.gestures.playGesture('acknowledge');

        // Store in memory
        this.systems.memory.addConversation({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });

        // Analyze message for persona adaptation
        this.systems.persona.analyzeInput(message);

        // Check for special commands
        if (this.handleSpecialCommands(message)) {
            return;
        }

        // Generate response
        const response = await this.generateResponse(message);

        // Display assistant response with lip-sync
        await this.respondWithAnimation(response);

        // Update self-development metrics
        this.systems.selfDev.recordInteraction({
            input: message,
            output: response,
            timestamp: Date.now()
        });

        // Update memory stats display
        this.updateMemoryStats();
    }

    /**
     * Handle special commands (code, youtube, etc.)
     */
    handleSpecialCommands(message) {
        const lowerMessage = message.toLowerCase();

        // YouTube commands
        if (lowerMessage.includes('play video') || lowerMessage.includes('youtube')) {
            const urlMatch = message.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (urlMatch) {
                this.systems.youtube.show();
                this.systems.youtube.play(urlMatch[0]);
                this.addMessage("I've opened the video for you in picture-in-picture mode.", 'assistant');
                return true;
            }
        }

        // Code-related commands
        if (lowerMessage.includes('debug') || lowerMessage.includes('code') || 
            lowerMessage.includes('function') || lowerMessage.includes('snippet')) {
            // Let the coding assistant handle it
            return false;
        }

        return false;
    }

    /**
     * Generate AI response (placeholder for actual AI integration)
     */
    async generateResponse(message) {
        const persona = this.systems.persona.getCurrentPersona();
        const memory = this.systems.memory.getRelevantContext(message);
        
        // Check if this is a coding question
        if (this.systems.codingAssistant.isCodingRelated(message)) {
            return await this.systems.codingAssistant.handleQuery(message, memory);
        }

        // Generate contextual response based on persona and memory
        const greetings = {
            professional: "I understand your request. Let me help you with that.",
            casual: "Got it! Let me figure that out for you.",
            empathetic: "I hear you, and I'm here to help with whatever you need.",
            motivational: "Great question! Let's tackle this together!",
            humorous: "Interesting query! Let me put on my thinking cap... 🎩"
        };

        // This is a placeholder - in production, this would connect to an AI service
        return greetings[persona] || "I'm processing your request. How can I assist you further?";
    }

    /**
     * Respond with synchronized animation
     */
    async respondWithAnimation(response) {
        // Set expression to happy/engaged
        this.systems.expressions.setExpression('happy');

        // Start lip-sync
        this.systems.lipSync.startSpeaking(response);

        // Add appropriate gestures
        this.systems.gestures.playGesture('explain');

        // Display message gradually (typewriter effect)
        await this.addMessageAnimated(response, 'assistant');

        // Store in memory
        this.systems.memory.addConversation({
            role: 'assistant',
            content: response,
            timestamp: Date.now()
        });

        // Return to idle after speaking
        setTimeout(() => {
            this.systems.lipSync.stopSpeaking();
            this.systems.expressions.setExpression('neutral');
            this.systems.gestures.playGesture('idle');
        }, response.length * 50);
    }

    /**
     * Add message to chat display
     */
    addMessage(content, role) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messageEl.textContent = content;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Add message with typewriter animation
     */
    async addMessageAnimated(content, role) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messagesContainer.appendChild(messageEl);

        // Typewriter effect
        for (let i = 0; i <= content.length; i++) {
            messageEl.textContent = content.substring(0, i);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
    }

    /**
     * Handle quick action buttons
     */
    handleQuickAction(action) {
        switch (action) {
            case 'calendar':
                this.systems.google.openCalendar();
                this.addMessage("Opening your calendar. Would you like me to help schedule something?", 'assistant');
                break;
            case 'code':
                this.addMessage("I'm ready to help with coding! You can ask me to debug, optimize, or write code in Python, JavaScript, C++, Java, and more.", 'assistant');
                break;
            case 'youtube':
                this.systems.youtube.show();
                this.addMessage("YouTube player is ready! Paste a URL or tell me what you'd like to watch.", 'assistant');
                break;
            case 'files':
                this.systems.google.openDrive();
                this.addMessage("Accessing your files. What would you like to find or manage?", 'assistant');
                break;
        }

        // Animate avatar response
        this.systems.expressions.setExpression('helpful');
        this.systems.gestures.playGesture('point');
    }

    /**
     * Handle integration connections
     */
    async handleIntegrationClick(service) {
        const statusEl = document.querySelector(`.integration-item[data-service="${service}"] .integration-status`);
        
        if (service === 'google') {
            const connected = await this.systems.google.connect();
            if (connected) {
                statusEl?.classList.remove('disconnected');
                statusEl?.classList.add('connected');
                statusEl.textContent = 'Connected';
                this.addMessage("Google services connected! I can now access your Calendar, Drive, Gmail, and more.", 'assistant');
            }
        } else if (service === 'grok') {
            const connected = await this.systems.grok.connect();
            if (connected) {
                statusEl?.classList.remove('disconnected');
                statusEl?.classList.add('connected');
                statusEl.textContent = 'Connected';
                this.addMessage("Grok integration active! I can sync your tasks and workflows from X.com and Grok platforms.", 'assistant');
            }
        }
    }

    /**
     * Toggle voice input
     */
    toggleVoiceInput() {
        const voiceBtn = document.getElementById('voice-btn');
        
        if (!this.isRecording) {
            // Start recording
            this.isRecording = true;
            voiceBtn?.classList.add('recording');
            this.updateStatus('Listening...', 'listening');
            this.systems.expressions.setExpression('listening');

            // Web Speech API for voice recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;

                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    document.getElementById('chat-input').value = transcript;
                    this.handleUserMessage(transcript);
                };

                this.recognition.onend = () => {
                    this.isRecording = false;
                    voiceBtn?.classList.remove('recording');
                    this.updateStatus('Elara is ready', 'ready');
                };

                this.recognition.start();
            } else {
                this.addMessage("Voice input is not supported in this browser.", 'assistant');
                this.isRecording = false;
                voiceBtn?.classList.remove('recording');
            }
        } else {
            // Stop recording
            this.recognition?.stop();
            this.isRecording = false;
            voiceBtn?.classList.remove('recording');
            this.updateStatus('Elara is ready', 'ready');
        }
    }

    /**
     * Update avatar status display
     */
    updateStatus(text, state) {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');

        if (statusText) statusText.textContent = text;
        
        if (statusIndicator) {
            statusIndicator.style.background = {
                ready: 'var(--success-color)',
                listening: 'var(--warning-color)',
                thinking: 'var(--primary-color)',
                error: 'var(--error-color)'
            }[state] || 'var(--success-color)';
        }
    }

    /**
     * Update memory statistics display
     */
    updateMemoryStats() {
        const stats = this.systems.memory.getStats();
        
        const conversationsEl = document.getElementById('memory-conversations');
        const preferencesEl = document.getElementById('memory-preferences');

        if (conversationsEl) conversationsEl.textContent = stats.conversations;
        if (preferencesEl) preferencesEl.textContent = stats.preferences;
    }

    /**
     * Start the main animation loop
     */
    startAnimationLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update animation systems
            this.systems.animation?.update();
            this.systems.avatar?.render();
        };

        animate();
    }

    /**
     * Load saved application state
     */
    async loadState() {
        const savedPersona = this.systems.memory.get('persona');
        if (savedPersona) {
            this.systems.persona.setPersona(savedPersona);
            const personaSelect = document.getElementById('persona-select');
            if (personaSelect) personaSelect.value = savedPersona;
        }

        // Restore integration states
        const googleConnected = this.systems.memory.get('google_connected');
        if (googleConnected) {
            await this.systems.google.restore();
        }

        // Update memory stats
        this.updateMemoryStats();
    }

    /**
     * Display welcome message
     */
    displayWelcome() {
        const persona = this.systems.persona.getCurrentPersona();
        const userName = this.systems.memory.get('user_name');
        
        let greeting = userName 
            ? `Welcome back, ${userName}! ` 
            : 'Hello! ';

        greeting += "I'm Elara, your AI assistant. I'm here to help with coding, scheduling, managing files, or just having a conversation. How can I assist you today?";

        // Animate the welcome
        this.systems.expressions.setExpression('happy');
        this.systems.gestures.playGesture('wave');
        
        setTimeout(() => {
            this.addMessageAnimated(greeting, 'assistant');
        }, 500);
    }
}

// Initialize Elara when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.elara = new ElaraApp();
    window.elara.init();
});

export { ElaraApp };
