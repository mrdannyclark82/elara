/**
 * Self-Development System
 * Enables recursive and proactive self-improvement
 */

export class SelfDevelopment {
    constructor(systems) {
        this.systems = systems;
        this.metrics = {
            interactions: [],
            performance: {
                responseAccuracy: [],
                userSatisfaction: [],
                taskCompletion: []
            },
            improvements: [],
            proposals: []
        };
        this.evaluationInterval = 50; // Evaluate every N interactions
        this.lastEvaluation = 0;
    }

    /**
     * Record an interaction for analysis
     */
    recordInteraction(interaction) {
        this.metrics.interactions.push({
            ...interaction,
            id: this.generateId()
        });

        // Keep only recent interactions
        if (this.metrics.interactions.length > 200) {
            this.metrics.interactions = this.metrics.interactions.slice(-200);
        }

        // Periodic self-evaluation
        if (this.metrics.interactions.length - this.lastEvaluation >= this.evaluationInterval) {
            this.performSelfEvaluation();
            this.lastEvaluation = this.metrics.interactions.length;
        }
    }

    /**
     * Perform self-evaluation
     */
    performSelfEvaluation() {
        console.log('🔍 Performing self-evaluation...');

        const evaluation = {
            timestamp: Date.now(),
            metrics: this.calculateMetrics(),
            gaps: this.identifyKnowledgeGaps(),
            strengths: this.identifyStrengths(),
            recommendations: []
        };

        // Generate recommendations based on evaluation
        evaluation.recommendations = this.generateRecommendations(evaluation);

        this.metrics.improvements.push(evaluation);

        // Store evaluation in memory
        this.systems.memory?.set?.('last_evaluation', evaluation);

        console.log('✅ Self-evaluation complete');
        return evaluation;
    }

    /**
     * Calculate performance metrics
     */
    calculateMetrics() {
        const recent = this.metrics.interactions.slice(-50);
        
        return {
            totalInteractions: this.metrics.interactions.length,
            recentInteractions: recent.length,
            averageResponseTime: this.calculateAverageResponseTime(recent),
            topicDistribution: this.analyzeTopicDistribution(recent),
            sentimentTrend: this.analyzeSentimentTrend(recent)
        };
    }

    /**
     * Calculate average response time
     */
    calculateAverageResponseTime(interactions) {
        if (interactions.length === 0) return 0;
        
        let totalTime = 0;
        let count = 0;
        
        for (let i = 1; i < interactions.length; i++) {
            if (interactions[i].role === 'assistant' && interactions[i-1].role === 'user') {
                totalTime += interactions[i].timestamp - interactions[i-1].timestamp;
                count++;
            }
        }
        
        return count > 0 ? totalTime / count : 0;
    }

    /**
     * Analyze topic distribution in conversations
     */
    analyzeTopicDistribution(interactions) {
        const topics = {
            coding: 0,
            general: 0,
            calendar: 0,
            files: 0,
            youtube: 0,
            other: 0
        };

        const topicKeywords = {
            coding: ['code', 'function', 'debug', 'programming', 'javascript', 'python', 'error', 'bug', 'variable', 'class'],
            calendar: ['calendar', 'schedule', 'meeting', 'appointment', 'reminder', 'event'],
            files: ['file', 'document', 'folder', 'drive', 'upload', 'download'],
            youtube: ['video', 'youtube', 'watch', 'play', 'tutorial']
        };

        interactions.forEach(interaction => {
            if (interaction.role !== 'user') return;
            
            const text = (interaction.input || interaction.content || '').toLowerCase();
            let matched = false;
            
            for (const [topic, keywords] of Object.entries(topicKeywords)) {
                if (keywords.some(kw => text.includes(kw))) {
                    topics[topic]++;
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                topics.general++;
            }
        });

        return topics;
    }

    /**
     * Analyze sentiment trend
     */
    analyzeSentimentTrend(interactions) {
        const positiveWords = ['thank', 'great', 'good', 'awesome', 'perfect', 'love', 'helpful'];
        const negativeWords = ['bad', 'wrong', 'error', 'mistake', 'not working', 'confused', 'frustrated'];

        let positive = 0;
        let negative = 0;

        interactions.forEach(interaction => {
            if (interaction.role !== 'user') return;
            
            const text = (interaction.input || interaction.content || '').toLowerCase();
            
            if (positiveWords.some(w => text.includes(w))) positive++;
            if (negativeWords.some(w => text.includes(w))) negative++;
        });

        return { positive, negative, ratio: positive / (negative || 1) };
    }

    /**
     * Identify knowledge gaps
     */
    identifyKnowledgeGaps() {
        const gaps = [];
        const interactions = this.metrics.interactions;

        // Look for patterns indicating confusion or inability to help
        const uncertaintyPatterns = [
            'not sure',
            'unable to',
            'cannot',
            'don\'t know',
            'i\'m sorry',
            'unfortunately'
        ];

        const gapIndicators = {};

        interactions.forEach(interaction => {
            if (interaction.role !== 'assistant') return;
            
            const text = (interaction.output || interaction.content || '').toLowerCase();
            
            uncertaintyPatterns.forEach(pattern => {
                if (text.includes(pattern)) {
                    // Look at previous user message for context
                    const index = interactions.indexOf(interaction);
                    if (index > 0 && interactions[index - 1].role === 'user') {
                        const userQuery = interactions[index - 1].input || interactions[index - 1].content || '';
                        const keywords = this.extractKeywords(userQuery);
                        
                        keywords.forEach(keyword => {
                            gapIndicators[keyword] = (gapIndicators[keyword] || 0) + 1;
                        });
                    }
                }
            });
        });

        // Sort by frequency and return top gaps
        return Object.entries(gapIndicators)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, occurrences: count }));
    }

    /**
     * Identify strengths
     */
    identifyStrengths() {
        const strengths = [];
        const topicMetrics = this.calculateMetrics().topicDistribution;

        // Find most frequent topics
        const sortedTopics = Object.entries(topicMetrics)
            .sort((a, b) => b[1] - a[1]);

        sortedTopics.slice(0, 3).forEach(([topic, count]) => {
            if (count > 0) {
                strengths.push({
                    area: topic,
                    interactions: count,
                    confidence: count / this.metrics.interactions.length
                });
            }
        });

        return strengths;
    }

    /**
     * Generate improvement recommendations
     */
    generateRecommendations(evaluation) {
        const recommendations = [];

        // Based on knowledge gaps
        evaluation.gaps.forEach(gap => {
            if (gap.occurrences >= 3) {
                recommendations.push({
                    type: 'knowledge',
                    priority: 'high',
                    description: `Improve knowledge in: ${gap.topic}`,
                    action: `Research and integrate more information about "${gap.topic}"`,
                    metric: `Reduce uncertainty responses about ${gap.topic} by 50%`
                });
            }
        });

        // Based on sentiment
        if (evaluation.metrics.sentimentTrend.ratio < 2) {
            recommendations.push({
                type: 'engagement',
                priority: 'medium',
                description: 'Improve user satisfaction',
                action: 'Enhance response quality and empathy in interactions',
                metric: 'Increase positive sentiment ratio to 3:1'
            });
        }

        // Based on usage patterns
        const lowUsageTopics = Object.entries(evaluation.metrics.topicDistribution)
            .filter(([_, count]) => count < 5);

        lowUsageTopics.forEach(([topic]) => {
            if (topic !== 'other') {
                recommendations.push({
                    type: 'awareness',
                    priority: 'low',
                    description: `Promote ${topic} capabilities`,
                    action: `Proactively suggest ${topic} features when relevant`,
                    metric: `Increase ${topic} usage by 20%`
                });
            }
        });

        return recommendations;
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'i', 'you', 'we', 'they', 'it', 'this', 'that', 'can', 'how', 'what', 'why', 'when', 'where', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'my', 'your', 'me', 'and', 'or', 'but']);
        
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
    }

    /**
     * Propose a new enhancement
     */
    proposeEnhancement(proposal) {
        const enhancement = {
            id: this.generateId(),
            timestamp: Date.now(),
            ...proposal,
            status: 'proposed'
        };

        this.metrics.proposals.push(enhancement);
        return enhancement;
    }

    /**
     * Get pending proposals
     */
    getPendingProposals() {
        return this.metrics.proposals.filter(p => p.status === 'proposed');
    }

    /**
     * Accept a proposal
     */
    acceptProposal(proposalId) {
        const proposal = this.metrics.proposals.find(p => p.id === proposalId);
        if (proposal) {
            proposal.status = 'accepted';
            proposal.acceptedAt = Date.now();
            return true;
        }
        return false;
    }

    /**
     * Reject a proposal
     */
    rejectProposal(proposalId, reason) {
        const proposal = this.metrics.proposals.find(p => p.id === proposalId);
        if (proposal) {
            proposal.status = 'rejected';
            proposal.rejectedAt = Date.now();
            proposal.rejectionReason = reason;
            return true;
        }
        return false;
    }

    /**
     * Request user feedback
     */
    requestFeedback() {
        const feedbackQuestions = [
            "How would you rate my assistance today?",
            "Is there anything I could do better?",
            "What features would you like me to improve?",
            "Was I helpful in solving your problem?",
            "Would you like me to adjust my communication style?"
        ];

        // Select based on recent patterns
        const recentEvaluation = this.metrics.improvements[this.metrics.improvements.length - 1];
        
        if (recentEvaluation) {
            if (recentEvaluation.gaps.length > 0) {
                return "I noticed I might have had difficulty with some topics. Could you tell me what I could help you with better?";
            }
            if (recentEvaluation.metrics.sentimentTrend.ratio < 2) {
                return "I want to make sure I'm being helpful. Is there anything about my responses I could improve?";
            }
        }

        return feedbackQuestions[Math.floor(Math.random() * feedbackQuestions.length)];
    }

    /**
     * Record user feedback
     */
    recordFeedback(feedback) {
        this.metrics.performance.userSatisfaction.push({
            timestamp: Date.now(),
            feedback
        });

        // Keep only recent feedback
        if (this.metrics.performance.userSatisfaction.length > 100) {
            this.metrics.performance.userSatisfaction = this.metrics.performance.userSatisfaction.slice(-100);
        }
    }

    /**
     * Get development status summary
     */
    getStatus() {
        return {
            totalInteractions: this.metrics.interactions.length,
            evaluationsPerformed: this.metrics.improvements.length,
            pendingProposals: this.getPendingProposals().length,
            lastEvaluation: this.metrics.improvements[this.metrics.improvements.length - 1],
            overallHealth: this.calculateOverallHealth()
        };
    }

    /**
     * Calculate overall system health score
     */
    calculateOverallHealth() {
        const metrics = this.calculateMetrics();
        
        let score = 50; // Base score

        // Positive sentiment improves score
        if (metrics.sentimentTrend.ratio > 3) score += 20;
        else if (metrics.sentimentTrend.ratio > 2) score += 10;
        else if (metrics.sentimentTrend.ratio < 1) score -= 10;

        // Topic diversity is good
        const activeTopics = Object.values(metrics.topicDistribution).filter(v => v > 0).length;
        score += activeTopics * 5;

        // Recent activity is good
        if (metrics.recentInteractions > 30) score += 10;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
