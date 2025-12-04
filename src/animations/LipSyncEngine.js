/**
 * Lip Sync Engine
 * Synchronizes mouth movements with speech for natural lip-syncing
 */

export class LipSyncEngine {
    constructor(avatarSystem) {
        this.avatarSystem = avatarSystem;
        this.isSpeaking = false;
        this.currentViseme = 'neutral';
        this.visemeQueue = [];
        this.speechText = '';
        this.speechIndex = 0;
        this.animationFrame = null;
    }

    /**
     * Viseme mappings for different phonemes
     */
    static VISEMES = {
        neutral: { upperLip: 0, lowerLip: 0, mouthOpen: 0 },
        A: { upperLip: 0.3, lowerLip: 0.5, mouthOpen: 0.6 },      // "ah", "father"
        E: { upperLip: 0.2, lowerLip: 0.3, mouthOpen: 0.4 },      // "eh", "bed"
        I: { upperLip: 0.1, lowerLip: 0.2, mouthOpen: 0.3 },      // "ee", "see"
        O: { upperLip: 0.4, lowerLip: 0.4, mouthOpen: 0.5 },      // "oh", "go"
        U: { upperLip: 0.5, lowerLip: 0.3, mouthOpen: 0.3 },      // "oo", "moon"
        M: { upperLip: 0, lowerLip: 0, mouthOpen: 0 },            // "m", lips together
        B: { upperLip: 0, lowerLip: 0, mouthOpen: 0 },            // "b", "p"
        F: { upperLip: 0.1, lowerLip: 0.4, mouthOpen: 0.2 },      // "f", "v"
        L: { upperLip: 0.1, lowerLip: 0.3, mouthOpen: 0.35 },     // "l", tongue up
        TH: { upperLip: 0.2, lowerLip: 0.3, mouthOpen: 0.3 },     // "th"
        W: { upperLip: 0.4, lowerLip: 0.3, mouthOpen: 0.2 },      // "w", rounded
        R: { upperLip: 0.2, lowerLip: 0.25, mouthOpen: 0.3 },     // "r"
        S: { upperLip: 0.1, lowerLip: 0.2, mouthOpen: 0.25 },     // "s", "z"
        CH: { upperLip: 0.3, lowerLip: 0.3, mouthOpen: 0.35 },    // "ch", "sh"
        K: { upperLip: 0.2, lowerLip: 0.4, mouthOpen: 0.45 }      // "k", "g"
    };

    /**
     * Character to viseme mapping
     */
    static CHAR_TO_VISEME = {
        'a': 'A', 'á': 'A', 'à': 'A', 'â': 'A',
        'e': 'E', 'é': 'E', 'è': 'E', 'ê': 'E',
        'i': 'I', 'í': 'I', 'ì': 'I', 'î': 'I', 'y': 'I',
        'o': 'O', 'ó': 'O', 'ò': 'O', 'ô': 'O',
        'u': 'U', 'ú': 'U', 'ù': 'U', 'û': 'U',
        'm': 'M', 'n': 'M',
        'b': 'B', 'p': 'B',
        'f': 'F', 'v': 'F',
        'l': 'L',
        't': 'TH', 'd': 'TH',
        'w': 'W',
        'r': 'R',
        's': 'S', 'z': 'S',
        'c': 'CH', 'j': 'CH',
        'k': 'K', 'g': 'K', 'q': 'K'
    };

    /**
     * Start speaking with given text
     */
    startSpeaking(text) {
        this.isSpeaking = true;
        this.speechText = text.toLowerCase();
        this.speechIndex = 0;
        this.visemeQueue = this.textToVisemes(text);
        
        this.animateSpeech();
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        this.isSpeaking = false;
        this.speechText = '';
        this.speechIndex = 0;
        this.visemeQueue = [];
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Reset to neutral
        this.applyViseme('neutral');
    }

    /**
     * Convert text to viseme sequence
     */
    textToVisemes(text) {
        const visemes = [];
        const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, '');
        
        for (const char of cleanText) {
            if (char === ' ') {
                visemes.push({ viseme: 'neutral', duration: 80 });
            } else {
                const viseme = LipSyncEngine.CHAR_TO_VISEME[char] || 'neutral';
                visemes.push({ viseme, duration: 60 + Math.random() * 40 });
            }
        }

        return visemes;
    }

    /**
     * Animate through the viseme sequence
     */
    animateSpeech() {
        if (!this.isSpeaking || this.visemeQueue.length === 0) {
            this.applyViseme('neutral');
            return;
        }

        const current = this.visemeQueue.shift();
        this.applyViseme(current.viseme);

        setTimeout(() => {
            if (this.isSpeaking) {
                this.animateSpeech();
            }
        }, current.duration);
    }

    /**
     * Apply a viseme to the avatar's mouth
     */
    applyViseme(visemeName) {
        this.currentViseme = visemeName;
        const viseme = LipSyncEngine.VISEMES[visemeName] || LipSyncEngine.VISEMES.neutral;

        const mouth = this.avatarSystem?.getBone?.('mouth');
        if (!mouth) return;

        // Apply mouth shape
        const upperLip = mouth.getObjectByName?.('upperLip');
        const lowerLip = mouth.getObjectByName?.('lowerLip');
        const mouthInterior = mouth.getObjectByName?.('mouthInterior');

        if (upperLip) {
            upperLip.position.y = -0.1 + viseme.upperLip * 0.01;
        }

        if (lowerLip) {
            lowerLip.position.y = -0.115 - viseme.lowerLip * 0.015;
        }

        if (mouthInterior && mouthInterior.material) {
            mouthInterior.material.visible = viseme.mouthOpen > 0.3;
            mouthInterior.scale.setScalar(viseme.mouthOpen);
        }
    }

    /**
     * Get current viseme
     */
    getCurrentViseme() {
        return this.currentViseme;
    }

    /**
     * Check if currently speaking
     */
    getIsSpeaking() {
        return this.isSpeaking;
    }

    /**
     * Analyze audio for real-time lip sync (for future audio integration)
     */
    analyzeAudio(audioData) {
        // This would use Web Audio API to analyze audio frequencies
        // and map them to visemes for more accurate lip sync
        const amplitude = this.getAmplitude(audioData);
        
        if (amplitude > 0.7) {
            return 'A';
        } else if (amplitude > 0.5) {
            return 'O';
        } else if (amplitude > 0.3) {
            return 'E';
        } else if (amplitude > 0.1) {
            return 'I';
        }
        
        return 'neutral';
    }

    /**
     * Calculate amplitude from audio data
     */
    getAmplitude(audioData) {
        if (!audioData || audioData.length === 0) return 0;
        
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += Math.abs(audioData[i]);
        }
        
        return sum / audioData.length;
    }
}
