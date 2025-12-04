/**
 * Coding Assistant
 * Expert coding assistant proficient in multiple languages and frameworks
 */

export class CodingAssistant {
    constructor() {
        this.supportedLanguages = [
            'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
            'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'
        ];
        this.supportedFrameworks = [
            'react', 'vue', 'angular', 'nextjs', 'express', 'django',
            'flask', 'spring', 'tensorflow', 'pytorch', 'nodejs'
        ];
        this.codeContext = [];
    }

    /**
     * Check if a query is coding-related
     */
    isCodingRelated(query) {
        const codingKeywords = [
            'code', 'function', 'debug', 'error', 'bug', 'fix', 'programming',
            'variable', 'class', 'method', 'api', 'syntax', 'compile', 'runtime',
            'loop', 'array', 'object', 'string', 'number', 'boolean', 'type',
            'import', 'export', 'module', 'package', 'library', 'framework',
            'algorithm', 'data structure', 'optimize', 'refactor', 'test',
            ...this.supportedLanguages,
            ...this.supportedFrameworks
        ];

        const lowerQuery = query.toLowerCase();
        return codingKeywords.some(keyword => lowerQuery.includes(keyword));
    }

    /**
     * Handle a coding query
     */
    async handleQuery(query, context = {}) {
        const queryType = this.classifyQuery(query);
        
        switch (queryType) {
            case 'debug':
                return this.handleDebug(query, context);
            case 'explain':
                return this.handleExplain(query, context);
            case 'generate':
                return this.handleGenerate(query, context);
            case 'optimize':
                return this.handleOptimize(query, context);
            case 'general':
            default:
                return this.handleGeneral(query, context);
        }
    }

    /**
     * Classify the type of coding query
     */
    classifyQuery(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('debug') || lowerQuery.includes('error') || 
            lowerQuery.includes('bug') || lowerQuery.includes('fix') ||
            lowerQuery.includes('not working')) {
            return 'debug';
        }

        if (lowerQuery.includes('explain') || lowerQuery.includes('what does') ||
            lowerQuery.includes('how does') || lowerQuery.includes('why')) {
            return 'explain';
        }

        if (lowerQuery.includes('write') || lowerQuery.includes('create') ||
            lowerQuery.includes('generate') || lowerQuery.includes('make')) {
            return 'generate';
        }

        if (lowerQuery.includes('optimize') || lowerQuery.includes('improve') ||
            lowerQuery.includes('faster') || lowerQuery.includes('better')) {
            return 'optimize';
        }

        return 'general';
    }

    /**
     * Handle debugging requests
     */
    handleDebug(query, context) {
        // Store context for multi-turn debugging
        this.codeContext.push({ type: 'debug', query, timestamp: Date.now() });

        return `I can help you debug that! Here's my approach:

1. **Identify the Error**: What error message are you seeing? Is it a compile-time or runtime error?

2. **Common Issues to Check**:
   - Syntax errors (missing brackets, semicolons)
   - Type mismatches
   - Undefined variables or functions
   - Null/undefined reference errors

3. **Debugging Steps**:
   - Add console.log/print statements at key points
   - Use a debugger to step through the code
   - Check variable values at each step

Please share the code snippet and error message, and I'll help you find the issue!`;
    }

    /**
     * Handle code explanation requests
     */
    handleExplain(query, context) {
        this.codeContext.push({ type: 'explain', query, timestamp: Date.now() });

        return `I'd be happy to explain! To give you the best explanation, please share:

1. The code snippet you'd like me to explain
2. Any specific parts that are confusing

I'll break it down step by step:
- What each line does
- The overall logic flow
- Best practices and potential improvements

Paste your code, and I'll provide a detailed explanation!`;
    }

    /**
     * Handle code generation requests
     */
    handleGenerate(query, context) {
        this.codeContext.push({ type: 'generate', query, timestamp: Date.now() });

        const language = this.detectLanguage(query);
        
        return `I can generate that code for you! Let me understand the requirements:

**Detected Language**: ${language || 'Please specify'}

To create the best solution, please provide:
1. The specific functionality you need
2. Any input/output requirements
3. Error handling preferences
4. Performance considerations

I'll write clean, well-documented code following best practices for ${language || 'your chosen language'}.`;
    }

    /**
     * Handle optimization requests
     */
    handleOptimize(query, context) {
        this.codeContext.push({ type: 'optimize', query, timestamp: Date.now() });

        return `I can help optimize your code! Here's what I'll analyze:

**Performance Improvements**:
- Time complexity (Big O notation)
- Space complexity
- Algorithm efficiency

**Code Quality**:
- Readability improvements
- DRY principle (Don't Repeat Yourself)
- Modern language features

**Best Practices**:
- Error handling
- Edge cases
- Memory management

Share your code, and I'll provide specific optimization suggestions with benchmarks where applicable!`;
    }

    /**
     * Handle general coding questions
     */
    handleGeneral(query, context) {
        this.codeContext.push({ type: 'general', query, timestamp: Date.now() });

        return `I'm here to help with your coding question! I'm proficient in:

**Languages**: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin

**Frameworks**: React, Vue, Angular, Next.js, Express, Django, Flask, Spring, TensorFlow, PyTorch

How can I assist you? I can:
- Write code snippets
- Debug issues
- Explain concepts
- Suggest best practices
- Review code
- Help with architecture decisions

What would you like to work on?`;
    }

    /**
     * Detect programming language from query
     */
    detectLanguage(query) {
        const lowerQuery = query.toLowerCase();
        
        for (const lang of this.supportedLanguages) {
            if (lowerQuery.includes(lang)) {
                return this.formatLanguageName(lang);
            }
        }

        // Check for framework-specific language inference
        if (lowerQuery.includes('react') || lowerQuery.includes('vue') || 
            lowerQuery.includes('angular') || lowerQuery.includes('node')) {
            return 'JavaScript/TypeScript';
        }
        if (lowerQuery.includes('django') || lowerQuery.includes('flask') ||
            lowerQuery.includes('tensorflow') || lowerQuery.includes('pytorch')) {
            return 'Python';
        }
        if (lowerQuery.includes('spring')) {
            return 'Java';
        }

        return null;
    }

    /**
     * Format language name for display
     */
    formatLanguageName(lang) {
        const names = {
            javascript: 'JavaScript',
            typescript: 'TypeScript',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            c: 'C',
            csharp: 'C#',
            go: 'Go',
            rust: 'Rust',
            ruby: 'Ruby',
            php: 'PHP',
            swift: 'Swift',
            kotlin: 'Kotlin'
        };
        return names[lang] || lang;
    }

    /**
     * Format code for display
     */
    formatCode(code, language) {
        return `\`\`\`${language}\n${code}\n\`\`\``;
    }

    /**
     * Get code context for continued conversation
     */
    getContext() {
        return this.codeContext.slice(-5); // Last 5 interactions
    }

    /**
     * Clear code context
     */
    clearContext() {
        this.codeContext = [];
    }

    /**
     * Validate code syntax (placeholder)
     */
    validateSyntax(code, language) {
        // This would use a proper parser in production
        return { valid: true, errors: [] };
    }

    /**
     * Suggest improvements for code
     */
    suggestImprovements(code, language) {
        // This would use static analysis in production
        return [
            'Consider adding error handling',
            'Add JSDoc/docstring comments',
            'Consider using more descriptive variable names'
        ];
    }
}
