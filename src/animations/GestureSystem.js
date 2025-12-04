/**
 * Gesture System
 * Manages hand and body gestures for expressive communication
 */

export class GestureSystem {
    constructor(avatarSystem) {
        this.avatarSystem = avatarSystem;
        this.currentGesture = 'idle';
        this.gestureQueue = [];
        this.isPlaying = false;
    }

    /**
     * Predefined gestures
     */
    static GESTURES = {
        idle: {
            name: 'idle',
            duration: 2000,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
                { time: 1000, rotation: { x: 0.02, y: 0.03, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
                { time: 2000, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
            ],
            loop: true
        },
        wave: {
            name: 'wave',
            duration: 1500,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 200, rotation: { x: 0, y: 0.15, z: 0.1 } },
                { time: 400, rotation: { x: 0, y: -0.1, z: 0.15 } },
                { time: 600, rotation: { x: 0, y: 0.15, z: 0.1 } },
                { time: 800, rotation: { x: 0, y: -0.1, z: 0.15 } },
                { time: 1000, rotation: { x: 0, y: 0.1, z: 0.05 } },
                { time: 1500, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        nod: {
            name: 'nod',
            duration: 800,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 200, rotation: { x: 0.15, y: 0, z: 0 } },
                { time: 400, rotation: { x: -0.05, y: 0, z: 0 } },
                { time: 600, rotation: { x: 0.1, y: 0, z: 0 } },
                { time: 800, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        shake: {
            name: 'shake',
            duration: 1000,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 150, rotation: { x: 0, y: -0.15, z: 0 } },
                { time: 350, rotation: { x: 0, y: 0.15, z: 0 } },
                { time: 550, rotation: { x: 0, y: -0.12, z: 0 } },
                { time: 750, rotation: { x: 0, y: 0.1, z: 0 } },
                { time: 1000, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        think: {
            name: 'think',
            duration: 2000,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 500, rotation: { x: 0.1, y: 0.2, z: 0.05 } },
                { time: 1500, rotation: { x: 0.12, y: 0.18, z: 0.03 } },
                { time: 2000, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        acknowledge: {
            name: 'acknowledge',
            duration: 600,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 200, rotation: { x: 0.08, y: 0, z: 0 } },
                { time: 400, rotation: { x: 0.1, y: 0, z: 0 } },
                { time: 600, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        explain: {
            name: 'explain',
            duration: 3000,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 500, rotation: { x: 0.05, y: -0.1, z: 0 } },
                { time: 1000, rotation: { x: 0.03, y: 0.1, z: 0 } },
                { time: 1500, rotation: { x: 0.07, y: -0.08, z: 0.02 } },
                { time: 2000, rotation: { x: 0.02, y: 0.12, z: -0.02 } },
                { time: 2500, rotation: { x: 0.04, y: -0.05, z: 0 } },
                { time: 3000, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        point: {
            name: 'point',
            duration: 1200,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 300, rotation: { x: 0, y: 0.2, z: 0.05 } },
                { time: 800, rotation: { x: 0.05, y: 0.25, z: 0.08 } },
                { time: 1200, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        },
        shrug: {
            name: 'shrug',
            duration: 1500,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 }, shoulderRaise: 0 },
                { time: 300, rotation: { x: 0, y: 0, z: 0.05 }, shoulderRaise: 0.3 },
                { time: 600, rotation: { x: 0.05, y: 0, z: 0.08 }, shoulderRaise: 0.5 },
                { time: 1000, rotation: { x: 0.03, y: 0, z: 0.05 }, shoulderRaise: 0.3 },
                { time: 1500, rotation: { x: 0, y: 0, z: 0 }, shoulderRaise: 0 }
            ],
            loop: false
        },
        excited: {
            name: 'excited',
            duration: 1200,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 }, scale: { y: 1 } },
                { time: 200, rotation: { x: -0.1, y: 0, z: 0 }, scale: { y: 1.02 } },
                { time: 400, rotation: { x: -0.05, y: 0.1, z: 0.05 }, scale: { y: 1.01 } },
                { time: 600, rotation: { x: -0.08, y: -0.1, z: -0.05 }, scale: { y: 1.02 } },
                { time: 800, rotation: { x: -0.03, y: 0.05, z: 0.02 }, scale: { y: 1.01 } },
                { time: 1000, rotation: { x: -0.05, y: 0, z: 0 }, scale: { y: 1 } },
                { time: 1200, rotation: { x: 0, y: 0, z: 0 }, scale: { y: 1 } }
            ],
            loop: false
        },
        lean: {
            name: 'lean',
            duration: 2000,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 800, rotation: { x: 0.15, y: 0, z: 0 } },
                { time: 1200, rotation: { x: 0.15, y: 0, z: 0 } },
                { time: 2000, rotation: { x: 0, y: 0, z: 0 } }
            ],
            loop: false
        }
    };

    /**
     * Play a gesture by name
     */
    playGesture(gestureName) {
        const gesture = GestureSystem.GESTURES[gestureName];
        if (!gesture) {
            console.warn(`Unknown gesture: ${gestureName}`);
            return;
        }

        // If already playing, queue this gesture
        if (this.isPlaying && !gesture.loop) {
            this.gestureQueue.push(gestureName);
            return;
        }

        this.currentGesture = gestureName;
        this.isPlaying = true;

        this.animateGesture(gesture);
    }

    /**
     * Animate a gesture through its keyframes
     */
    animateGesture(gesture) {
        const avatar = this.avatarSystem?.getAvatar?.();
        if (!avatar) return;

        const startTime = performance.now();
        const keyframes = gesture.keyframes;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            let currentTime = elapsed;

            // Handle looping
            if (gesture.loop) {
                currentTime = elapsed % gesture.duration;
            }

            // Find current keyframe segment
            let prevFrame = keyframes[0];
            let nextFrame = keyframes[1];

            for (let i = 1; i < keyframes.length; i++) {
                if (keyframes[i].time >= currentTime) {
                    prevFrame = keyframes[i - 1];
                    nextFrame = keyframes[i];
                    break;
                }
            }

            // Calculate interpolation progress
            const segmentDuration = nextFrame.time - prevFrame.time;
            const segmentProgress = segmentDuration > 0 
                ? (currentTime - prevFrame.time) / segmentDuration 
                : 1;
            const easedProgress = this.easeInOutCubic(Math.min(segmentProgress, 1));

            // Apply rotation
            if (prevFrame.rotation && nextFrame.rotation) {
                avatar.rotation.x = this.lerp(prevFrame.rotation.x, nextFrame.rotation.x, easedProgress);
                avatar.rotation.y = this.lerp(prevFrame.rotation.y, nextFrame.rotation.y, easedProgress);
                avatar.rotation.z = this.lerp(prevFrame.rotation.z, nextFrame.rotation.z, easedProgress);
            }

            // Apply scale if present
            if (prevFrame.scale && nextFrame.scale) {
                if (prevFrame.scale.y !== undefined) {
                    avatar.scale.y = this.lerp(prevFrame.scale.y, nextFrame.scale.y, easedProgress);
                }
            }

            // Apply shoulder raise if present
            const shoulders = this.avatarSystem?.getBone?.('shoulders');
            if (shoulders && prevFrame.shoulderRaise !== undefined) {
                const raiseAmount = this.lerp(prevFrame.shoulderRaise || 0, nextFrame.shoulderRaise || 0, easedProgress);
                shoulders.position.y = -0.45 + raiseAmount * 0.05;
            }

            // Continue animation or finish
            if (gesture.loop || elapsed < gesture.duration) {
                requestAnimationFrame(animate);
            } else {
                this.onGestureComplete(gesture);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Called when a gesture completes
     */
    onGestureComplete(gesture) {
        this.isPlaying = false;
        this.currentGesture = 'idle';

        // Play next queued gesture
        if (this.gestureQueue.length > 0) {
            const nextGesture = this.gestureQueue.shift();
            setTimeout(() => this.playGesture(nextGesture), 100);
        } else {
            // Return to idle
            this.playGesture('idle');
        }
    }

    /**
     * Stop current gesture
     */
    stopGesture() {
        this.isPlaying = false;
        this.currentGesture = 'idle';
        this.gestureQueue = [];
    }

    /**
     * Get current gesture name
     */
    getCurrentGesture() {
        return this.currentGesture;
    }

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Ease in-out cubic
     */
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Queue multiple gestures
     */
    queueGestures(gestureNames) {
        this.gestureQueue.push(...gestureNames);
        if (!this.isPlaying) {
            const first = this.gestureQueue.shift();
            if (first) this.playGesture(first);
        }
    }

    /**
     * Play a random gesture from a category
     */
    playRandomGesture(category = 'all') {
        const categories = {
            greeting: ['wave', 'nod'],
            response: ['nod', 'acknowledge', 'think'],
            emotion: ['excited', 'shrug'],
            communication: ['explain', 'point', 'lean'],
            all: Object.keys(GestureSystem.GESTURES).filter(g => g !== 'idle')
        };

        const gestures = categories[category] || categories.all;
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
        this.playGesture(randomGesture);
    }
}
