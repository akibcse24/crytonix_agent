/**
 * MemoryManager - Short-term and Long-term Memory
 * Manages conversation history, entity extraction, and knowledge storage
 */

import type {
    AgentMemory,
    MemoryEntry,
    Message,
    EntityRelation,
} from '@/lib/types/agent.types';
import { cache } from '@/lib/cache';

export class MemoryManager {
    private shortTermMemory: Message[] = [];
    private longTermMemory: MemoryEntry[] = [];
    private entityGraph: EntityRelation[] = [];
    private maxShortTermSize: number;
    private agentId: string;

    constructor(agentId: string, maxShortTermSize: number = 50) {
        this.agentId = agentId;
        this.maxShortTermSize = maxShortTermSize;
    }

    /**
     * Add a message to short-term memory
     */
    addMessage(message: Message): void {
        this.shortTermMemory.push(message);

        // Keep only recent messages
        if (this.shortTermMemory.length > this.maxShortTermSize) {
            // Move oldest to long-term if important
            const removed = this.shortTermMemory.shift();
            if (removed && this.isImportant(removed)) {
                this.addToLongTerm({
                    id: crypto.randomUUID(),
                    content: removed.content || '',
                    metadata: {
                        source: 'conversation',
                        timestamp: Date.now(),
                    },
                });
            }
        }

        this.saveToCache();
    }

    /**
     * Get recent conversation history
     */
    getRecentMessages(count: number = 10): Message[] {
        return this.shortTermMemory.slice(-count);
    }

    /**
     * Get all short-term messages
     */
    getAllMessages(): Message[] {
        return [...this.shortTermMemory];
    }

    /**
     * Add entry to long-term memory
     */
    addToLongTerm(entry: MemoryEntry): void {
        this.longTermMemory.push(entry);
        this.saveToCache();
    }

    /**
     * Search long-term memory
     */
    searchLongTerm(query: string): MemoryEntry[] {
        const queryLower = query.toLowerCase();
        return this.longTermMemory
            .filter((entry) => entry.content.toLowerCase().includes(queryLower))
            .sort((a, b) => (b.metadata.relevance || 0) - (a.metadata.relevance || 0))
            .slice(0, 5);
    }

    /**
     * Add entity relation to knowledge graph
     */
    addEntityRelation(relation: EntityRelation): void {
        this.entityGraph.push(relation);
        this.saveToCache();
    }

    /**
     * Get related entities
     */
    getRelatedEntities(entity: string): EntityRelation[] {
        return this.entityGraph.filter(
            (rel) => rel.source === entity || rel.target === entity
        );
    }

    /**
     * Summarize conversation for context compression
     */
    async summarizeConversation(llmGenerate: (messages: Message[]) => Promise<string>): Promise<string> {
        if (this.shortTermMemory.length < 5) {
            return '';
        }

        try {
            const summary = await llmGenerate([
                {
                    role: 'system',
                    content: 'Summarize the following conversation concisely, focusing on key points and decisions.',
                },
                {
                    role: 'user',
                    content: this.shortTermMemory.map((m) => `${m.role}: ${m.content}`).join('\n'),
                },
            ]);

            // Store summary in long-term memory
            this.addToLongTerm({
                id: crypto.randomUUID(),
                content: summary,
                metadata: {
                    source: 'summary',
                    timestamp: Date.now(),
                    relevance: 1.0,
                },
            });

            return summary;
        } catch (error) {
            console.error('Error summarizing conversation:', error);
            return '';
        }
    }

    /**
     * Clear short-term memory
     */
    clearShortTerm(): void {
        this.shortTermMemory = [];
        this.saveToCache();
    }

    /**
     * Get memory state for persistence
     */
    getState(): AgentMemory {
        return {
            shortTerm: this.shortTermMemory,
            longTerm: this.longTermMemory,
            entityGraph: this.entityGraph,
        };
    }

    /**
     * Restore memory state
     */
    setState(state: AgentMemory): void {
        this.shortTermMemory = state.shortTerm || [];
        this.longTermMemory = state.longTerm || [];
        this.entityGraph = state.entityGraph || [];
        this.saveToCache();
    }

    /**
     * Check if message is important enough for long-term storage
     */
    private isImportant(message: Message): boolean {
        if (!message.content) return false;

        // Check for keywords indicating importance
        const importantKeywords = [
            'important',
            'remember',
            'note',
            'key',
            'critical',
            'decision',
            'agreed',
            'plan',
        ];

        const content = message.content.toLowerCase();
        return importantKeywords.some((keyword) => content.includes(keyword));
    }

    /**
     * Save memory to cache
     */
    /**
     * Save memory to cache
     */
    private async saveToCache(): Promise<void> {
        const cacheKey = `agent-memory-${this.agentId}`;
        await cache.set(cacheKey, this.getState(), 3600 * 24); // 24 hour TTL
    }

    /**
     * Load memory from cache
     */
    private async loadFromCache(): Promise<void> {
        const cacheKey = `agent-memory-${this.agentId}`;
        const cached = await cache.get<AgentMemory>(cacheKey);

        if (cached) {
            this.setState(cached);
        }
    }

    /**
     * Get memory statistics
     */
    async init(): Promise<void> {
        await this.loadFromCache();
    }

    /**
     * Get memory statistics
     */
    getStats() {
        return {
            shortTermCount: this.shortTermMemory.length,
            longTermCount: this.longTermMemory.length,
            entityCount: this.entityGraph.length,
            // oldestMessage: this.shortTermMemory[0]?.timestamp, // Removed invalid property
            // newestMessage: this.shortTermMemory[this.shortTermMemory.length - 1]?.timestamp, // Removed invalid property
        };
    }
}
