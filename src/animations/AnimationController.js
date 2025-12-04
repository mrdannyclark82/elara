/**
 * Animation Controller
 * Manages all avatar animations for fluid real-time movements
 */

export class AnimationController {
    constructor(avatarSystem) {
        this.avatarSystem = avatarSystem;
        this.animations = new Map();
        this.currentAnimations = [];
        this.time = 0;
        this.deltaTime = 0;
        this.lastTime = performance.now();
    }

    /**
     * Update all active animations
     */
    update() {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.time += this.deltaTime;

        // Update each active animation
        this.currentAnimations = this.currentAnimations.filter(anim => {
            const completed = this.updateAnimation(anim);
            return !completed;
        });
    }

    /**
     * Update a single animation
     */
    updateAnimation(animation) {
        const { startTime, duration, easing, target, property, from, to, onUpdate, onComplete } = animation;
        
        const elapsed = (this.time - startTime) * 1000;
        let progress = Math.min(elapsed / duration, 1);
        
        // Apply easing
        progress = this.applyEasing(progress, easing);

        // Calculate current value
        const currentValue = this.lerp(from, to, progress);

        // Apply to target
        if (target && property) {
            this.setProperty(target, property, currentValue);
        }

        // Call update callback
        if (onUpdate) {
            onUpdate(currentValue, progress);
        }

        // Check if complete
        if (progress >= 1) {
            if (onComplete) onComplete();
            return true;
        }

        return false;
    }

    /**
     * Start a new animation
     */
    animate(options) {
        const animation = {
            startTime: this.time,
            duration: options.duration || 1000,
            easing: options.easing || 'easeInOutQuad',
            target: options.target,
            property: options.property,
            from: options.from,
            to: options.to,
            onUpdate: options.onUpdate,
            onComplete: options.onComplete
        };

        this.currentAnimations.push(animation);
        return animation;
    }

    /**
     * Create a sequence of animations
     */
    sequence(animations) {
        let delay = 0;
        
        animations.forEach(anim => {
            setTimeout(() => this.animate(anim), delay);
            delay += anim.duration || 1000;
        });
    }

    /**
     * Apply easing function
     */
    applyEasing(t, type) {
        const easings = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInElastic: t => {
                if (t === 0 || t === 1) return t;
                return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
            },
            easeOutElastic: t => {
                if (t === 0 || t === 1) return t;
                return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
            },
            easeOutBounce: t => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            }
        };

        return (easings[type] || easings.linear)(t);
    }

    /**
     * Linear interpolation
     */
    lerp(from, to, progress) {
        if (typeof from === 'number') {
            return from + (to - from) * progress;
        }
        
        if (from && typeof from === 'object') {
            const result = {};
            for (const key in from) {
                result[key] = this.lerp(from[key], to[key], progress);
            }
            return result;
        }

        return to;
    }

    /**
     * Set property on target object
     */
    setProperty(target, property, value) {
        const parts = property.split('.');
        let obj = target;
        
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }
        
        obj[parts[parts.length - 1]] = value;
    }

    /**
     * Stop an animation
     */
    stop(animation) {
        const index = this.currentAnimations.indexOf(animation);
        if (index > -1) {
            this.currentAnimations.splice(index, 1);
        }
    }

    /**
     * Stop all animations
     */
    stopAll() {
        this.currentAnimations = [];
    }

    /**
     * Check if any animations are running
     */
    isAnimating() {
        return this.currentAnimations.length > 0;
    }
}
