/**
 * Facial Expression System
 * Manages facial expressions for conveying emotions and engagement
 */

export class FacialExpressionSystem {
    constructor(avatarSystem) {
        this.avatarSystem = avatarSystem;
        this.currentExpression = 'neutral';
        this.transitionDuration = 300;
        this.blendWeights = {};
    }

    /**
     * Predefined facial expressions
     */
    static EXPRESSIONS = {
        neutral: {
            name: 'neutral',
            eyebrows: { raise: 0, furrow: 0 },
            eyes: { wide: 0, squint: 0 },
            mouth: { smile: 0, frown: 0, open: 0 },
            cheeks: { raise: 0 }
        },
        happy: {
            name: 'happy',
            eyebrows: { raise: 0.2, furrow: 0 },
            eyes: { wide: 0.1, squint: 0.3 },
            mouth: { smile: 0.7, frown: 0, open: 0.1 },
            cheeks: { raise: 0.5 }
        },
        thinking: {
            name: 'thinking',
            eyebrows: { raise: 0.1, furrow: 0.4 },
            eyes: { wide: 0, squint: 0.2 },
            mouth: { smile: 0, frown: 0.1, open: 0 },
            cheeks: { raise: 0 }
        },
        surprised: {
            name: 'surprised',
            eyebrows: { raise: 0.8, furrow: 0 },
            eyes: { wide: 0.7, squint: 0 },
            mouth: { smile: 0, frown: 0, open: 0.5 },
            cheeks: { raise: 0 }
        },
        concerned: {
            name: 'concerned',
            eyebrows: { raise: 0.3, furrow: 0.5 },
            eyes: { wide: 0.2, squint: 0 },
            mouth: { smile: 0, frown: 0.3, open: 0 },
            cheeks: { raise: 0 }
        },
        listening: {
            name: 'listening',
            eyebrows: { raise: 0.2, furrow: 0 },
            eyes: { wide: 0.2, squint: 0 },
            mouth: { smile: 0.2, frown: 0, open: 0 },
            cheeks: { raise: 0.1 }
        },
        empathetic: {
            name: 'empathetic',
            eyebrows: { raise: 0.3, furrow: 0.3 },
            eyes: { wide: 0, squint: 0.2 },
            mouth: { smile: 0.3, frown: 0, open: 0 },
            cheeks: { raise: 0.2 }
        },
        excited: {
            name: 'excited',
            eyebrows: { raise: 0.6, furrow: 0 },
            eyes: { wide: 0.5, squint: 0.1 },
            mouth: { smile: 0.9, frown: 0, open: 0.3 },
            cheeks: { raise: 0.7 }
        },
        helpful: {
            name: 'helpful',
            eyebrows: { raise: 0.3, furrow: 0 },
            eyes: { wide: 0.1, squint: 0.1 },
            mouth: { smile: 0.5, frown: 0, open: 0.1 },
            cheeks: { raise: 0.3 }
        },
        focused: {
            name: 'focused',
            eyebrows: { raise: 0, furrow: 0.3 },
            eyes: { wide: 0, squint: 0.4 },
            mouth: { smile: 0, frown: 0, open: 0 },
            cheeks: { raise: 0 }
        },
        confident: {
            name: 'confident',
            eyebrows: { raise: 0.1, furrow: 0 },
            eyes: { wide: 0, squint: 0.2 },
            mouth: { smile: 0.4, frown: 0, open: 0 },
            cheeks: { raise: 0.3 }
        },
        curious: {
            name: 'curious',
            eyebrows: { raise: 0.5, furrow: 0.1 },
            eyes: { wide: 0.3, squint: 0 },
            mouth: { smile: 0.2, frown: 0, open: 0.1 },
            cheeks: { raise: 0.1 }
        },
        wink: {
            name: 'wink',
            eyebrows: { raise: 0.2, furrow: 0 },
            eyes: { wide: 0, squint: 0.2, rightWink: 0.9 },
            mouth: { smile: 0.5, frown: 0, open: 0 },
            cheeks: { raise: 0.3 }
        }
    };

    /**
     * Set a new expression with smooth transition
     */
    setExpression(expressionName, duration = null) {
        const expression = FacialExpressionSystem.EXPRESSIONS[expressionName];
        if (!expression) {
            console.warn(`Unknown expression: ${expressionName}`);
            return;
        }

        const fromExpression = FacialExpressionSystem.EXPRESSIONS[this.currentExpression];
        this.currentExpression = expressionName;

        this.transitionExpression(fromExpression, expression, duration || this.transitionDuration);
    }

    /**
     * Transition between expressions
     */
    transitionExpression(from, to, duration) {
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeInOutQuad(progress);

            // Blend expressions
            this.applyBlendedExpression(from, to, easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Apply blended expression to avatar
     */
    applyBlendedExpression(from, to, blend) {
        // Apply eyebrows
        this.applyEyebrows(
            this.lerpObject(from.eyebrows, to.eyebrows, blend)
        );

        // Apply eyes
        this.applyEyes(
            this.lerpObject(from.eyes, to.eyes, blend)
        );

        // Apply mouth
        this.applyMouth(
            this.lerpObject(from.mouth, to.mouth, blend)
        );

        // Apply cheeks
        this.applyCheeks(
            this.lerpObject(from.cheeks, to.cheeks, blend)
        );
    }

    /**
     * Apply eyebrow expression
     */
    applyEyebrows(params) {
        const eyebrows = this.avatarSystem?.getBone?.('eyebrows');
        if (!eyebrows) return;

        // Raise/lower eyebrows
        const raiseAmount = params.raise * 0.03;
        const furrowAmount = params.furrow * 0.02;

        eyebrows.position.y = 0 + raiseAmount;
        
        // Apply furrow by bringing eyebrows together and down slightly
        eyebrows.children.forEach((brow, index) => {
            const side = index === 0 ? -1 : 1;
            if (brow.position) {
                brow.position.x = side * 0.05 - (furrowAmount * 0.01 * side);
            }
        });
    }

    /**
     * Apply eye expression
     */
    applyEyes(params) {
        const eyes = this.avatarSystem?.getBone?.('eyes');
        if (!eyes) return;

        eyes.children.forEach((eye, index) => {
            // Wide/squint affects eye scale
            const scaleY = 1 + (params.wide * 0.2) - (params.squint * 0.3);
            eye.scale.y = Math.max(0.3, scaleY);

            // Wink (only right eye for now)
            if (params.rightWink !== undefined && index === 1) {
                eye.scale.y = Math.max(0.1, 1 - params.rightWink);
            }
        });
    }

    /**
     * Apply mouth expression
     */
    applyMouth(params) {
        const mouth = this.avatarSystem?.getBone?.('mouth');
        if (!mouth) return;

        const upperLip = mouth.getObjectByName?.('upperLip');
        const lowerLip = mouth.getObjectByName?.('lowerLip');
        const mouthInterior = mouth.getObjectByName?.('mouthInterior');

        if (upperLip) {
            // Smile curves corners up, frown curves down
            const smileEffect = params.smile * 0.01;
            upperLip.position.y = -0.1 + smileEffect;
            
            // Scale for smile width
            upperLip.scale.x = 1 + params.smile * 0.15;
        }

        if (lowerLip) {
            const frownEffect = params.frown * 0.01;
            lowerLip.position.y = -0.115 - frownEffect - (params.open * 0.02);
            
            // Scale for expression width
            lowerLip.scale.x = 1 + params.smile * 0.1;
        }

        if (mouthInterior && mouthInterior.material) {
            mouthInterior.material.visible = params.open > 0.2;
            mouthInterior.scale.setScalar(params.open);
        }
    }

    /**
     * Apply cheek expression
     */
    applyCheeks(params) {
        // Cheek raise affects the head/face slightly
        const head = this.avatarSystem?.getBone?.('head');
        if (!head) return;

        // Subtle scaling to simulate cheek raise
        head.scale.x = 1 + params.raise * 0.02;
    }

    /**
     * Blend between expressions based on emotion values
     */
    blendExpressions(emotionWeights) {
        // Reset blend weights
        this.blendWeights = {
            eyebrows: { raise: 0, furrow: 0 },
            eyes: { wide: 0, squint: 0 },
            mouth: { smile: 0, frown: 0, open: 0 },
            cheeks: { raise: 0 }
        };

        // Accumulate weighted expressions
        for (const [expressionName, weight] of Object.entries(emotionWeights)) {
            const expression = FacialExpressionSystem.EXPRESSIONS[expressionName];
            if (!expression || weight <= 0) continue;

            this.blendWeights.eyebrows.raise += expression.eyebrows.raise * weight;
            this.blendWeights.eyebrows.furrow += expression.eyebrows.furrow * weight;
            this.blendWeights.eyes.wide += expression.eyes.wide * weight;
            this.blendWeights.eyes.squint += expression.eyes.squint * weight;
            this.blendWeights.mouth.smile += expression.mouth.smile * weight;
            this.blendWeights.mouth.frown += expression.mouth.frown * weight;
            this.blendWeights.mouth.open += expression.mouth.open * weight;
            this.blendWeights.cheeks.raise += expression.cheeks.raise * weight;
        }

        // Apply blended result
        this.applyEyebrows(this.blendWeights.eyebrows);
        this.applyEyes(this.blendWeights.eyes);
        this.applyMouth(this.blendWeights.mouth);
        this.applyCheeks(this.blendWeights.cheeks);
    }

    /**
     * Get current expression name
     */
    getCurrentExpression() {
        return this.currentExpression;
    }

    /**
     * Play a micro-expression (brief flash of emotion)
     */
    playMicroExpression(expressionName, duration = 200) {
        const originalExpression = this.currentExpression;
        
        this.setExpression(expressionName, duration / 2);
        
        setTimeout(() => {
            this.setExpression(originalExpression, duration / 2);
        }, duration);
    }

    /**
     * React to sentiment in text
     */
    reactToSentiment(sentiment) {
        const sentimentExpressions = {
            positive: ['happy', 'excited', 'helpful'],
            negative: ['concerned', 'empathetic'],
            question: ['curious', 'thinking'],
            neutral: ['neutral', 'listening']
        };

        const expressions = sentimentExpressions[sentiment] || sentimentExpressions.neutral;
        const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
        
        this.setExpression(randomExpression);
    }

    /**
     * Linear interpolation for objects
     */
    lerpObject(from, to, t) {
        const result = {};
        for (const key in from) {
            if (typeof from[key] === 'number') {
                result[key] = from[key] + (to[key] - from[key]) * t;
            } else {
                result[key] = from[key];
            }
        }
        return result;
    }

    /**
     * Ease in-out quad
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * Reset to neutral expression
     */
    reset() {
        this.setExpression('neutral');
    }
}
