/**
 * YouTube Picture-in-Picture Player
 * Floating video player for multitasking
 */

export class YouTubePlayer {
    constructor() {
        this.container = null;
        this.iframe = null;
        this.currentVideoId = null;
        this.isVisible = false;
        this.isMinimized = false;
        this.position = { x: 20, y: 20 };
    }

    /**
     * Initialize the player
     */
    init() {
        this.container = document.getElementById('pip-player');
        this.setupDragging();
        this.setupControls();
    }

    /**
     * Setup dragging functionality
     */
    setupDragging() {
        const header = document.getElementById('pip-header');
        if (!header || !this.container) return;

        let isDragging = false;
        let startX, startY;
        let startRight, startBottom;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.container.getBoundingClientRect();
            startRight = window.innerWidth - rect.right;
            startBottom = window.innerHeight - rect.bottom;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = startX - e.clientX;
            const deltaY = startY - e.clientY;

            this.container.style.right = `${startRight + deltaX}px`;
            this.container.style.bottom = `${startBottom + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    /**
     * Setup player controls
     */
    setupControls() {
        const urlInput = document.getElementById('pip-url-input');
        
        urlInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.play(urlInput.value);
            }
        });
    }

    /**
     * Show the player
     */
    show() {
        if (!this.container) {
            this.container = document.getElementById('pip-player');
        }
        
        this.container?.classList.remove('hidden');
        this.isVisible = true;
    }

    /**
     * Hide the player
     */
    hide() {
        this.container?.classList.add('hidden');
        this.isVisible = false;
        this.stop();
    }

    /**
     * Minimize the player
     */
    minimize() {
        this.isMinimized = !this.isMinimized;
        
        const videoContainer = document.getElementById('pip-video-container');
        const toolbar = document.getElementById('pip-toolbar');
        
        if (this.isMinimized) {
            videoContainer?.classList.add('hidden');
            toolbar?.classList.add('hidden');
        } else {
            videoContainer?.classList.remove('hidden');
            toolbar?.classList.remove('hidden');
        }
    }

    /**
     * Play a video
     */
    play(input) {
        const videoId = this.extractVideoId(input);
        
        if (!videoId) {
            // Treat as search query
            this.searchAndPlay(input);
            return;
        }

        this.loadVideo(videoId);
    }

    /**
     * Load a video by ID
     */
    loadVideo(videoId) {
        this.currentVideoId = videoId;
        
        const videoContainer = document.getElementById('pip-video-container');
        if (!videoContainer) return;

        // Remove placeholder
        const placeholder = document.getElementById('pip-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Create or update iframe
        if (!this.iframe) {
            this.iframe = document.createElement('iframe');
            this.iframe.id = 'pip-iframe';
            this.iframe.style.width = '100%';
            this.iframe.style.height = '100%';
            this.iframe.style.border = 'none';
            this.iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            this.iframe.allowFullscreen = true;
            videoContainer.appendChild(this.iframe);
        }

        this.iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

        // Update title
        this.updateTitle(videoId);
    }

    /**
     * Extract video ID from URL
     */
    extractVideoId(input) {
        if (!input) return null;

        // Direct video ID (11 characters)
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
            return input;
        }

        // Various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    /**
     * Search YouTube and play first result
     */
    async searchAndPlay(query) {
        console.log('Searching YouTube for:', query);
        
        // In production, this would use YouTube Data API
        // For now, open YouTube search in player or show message
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        
        const videoContainer = document.getElementById('pip-video-container');
        const placeholder = document.getElementById('pip-placeholder');
        
        if (placeholder) {
            placeholder.innerHTML = `<a href="${searchUrl}" target="_blank" style="color: var(--primary-light);">Search YouTube for "${query}"</a>`;
            placeholder.style.display = 'flex';
        }
    }

    /**
     * Update player title
     */
    updateTitle(videoId) {
        const titleEl = document.getElementById('pip-title');
        if (titleEl) {
            titleEl.textContent = `Playing: ${videoId}`;
        }
    }

    /**
     * Stop playback
     */
    stop() {
        if (this.iframe) {
            this.iframe.src = '';
        }
        this.currentVideoId = null;
        
        const placeholder = document.getElementById('pip-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.innerHTML = '<span>Enter a YouTube URL or search</span>';
        }
    }

    /**
     * Pause/Resume playback
     */
    togglePlayback() {
        // Would use YouTube IFrame API for precise control
        console.log('Toggle playback');
    }

    /**
     * Set volume
     */
    setVolume(level) {
        // Would use YouTube IFrame API
        console.log('Set volume:', level);
    }

    /**
     * Toggle subtitles/captions
     */
    toggleSubtitles() {
        // Would use YouTube IFrame API
        console.log('Toggle subtitles');
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isVisible: this.isVisible,
            isMinimized: this.isMinimized,
            currentVideoId: this.currentVideoId
        };
    }

    /**
     * Recommend a video based on context
     */
    recommendVideo(topic) {
        // Sample recommendations based on topic
        const recommendations = {
            coding: [
                { id: 'PkZNo7MFNFg', title: 'JavaScript Tutorial for Beginners' },
                { id: 'rfscVS0vtbw', title: 'Python Tutorial for Beginners' }
            ],
            productivity: [
                { id: 'Dqe8r5b7sXo', title: 'Productivity Tips' },
                { id: 'QoE7gXLfVME', title: 'Time Management' }
            ],
            relaxation: [
                { id: '5qap5aO4i9A', title: 'Lofi Hip Hop Radio' }
            ]
        };

        const topicRecommendations = recommendations[topic.toLowerCase()] || [];
        
        if (topicRecommendations.length > 0) {
            return topicRecommendations[Math.floor(Math.random() * topicRecommendations.length)];
        }

        return null;
    }
}
