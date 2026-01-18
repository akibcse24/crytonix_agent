/**
 * RAG (Retrieval-Augmented Generation) Implementation
 * Combines vector search with LLM generation for enhanced responses
 */

import { vectorStore, type VectorDocument } from './VectorStore';
import { llmRouter } from '@/lib/llm';
import type { LLMParams, LLMResponse } from '@/lib/types/llm.types';

export interface RAGConfig {
    topK?: number;
    minSimilarity?: number;
    includeMetadata?: boolean;
    systemPrompt?: string;
}

export class RAGPipeline {
    private config: RAGConfig;

    constructor(config: RAGConfig = {}) {
        this.config = {
            topK: 5,
            minSimilarity: 0.7,
            includeMetadata: true,
            ...config,
        };
    }

    /**
     * Generate response using RAG
     */
    async generate(query: string, params?: Partial<LLMParams>): Promise<LLMResponse> {
        // 1. Retrieve relevant documents
        const relevantDocs = await this.retrieve(query);

        // 2. Build augmented prompt
        const augmentedPrompt = this.buildPrompt(query, relevantDocs);

        // 3. Generate response with LLM
        const llmParams: LLMParams = {
            messages: [
                {
                    role: 'system',
                    content:
                        this.config.systemPrompt ||
                        'You are a helpful assistant. Use the provided context to answer questions accurately.',
                },
                {
                    role: 'user',
                    content: augmentedPrompt,
                },
            ],
            temperature: params?.temperature || 0.7,
            maxTokens: params?.maxTokens || 2000,
            ...params,
        };

        return llmRouter.generate(llmParams, {
            primary: 'openai',
            fallbacks: ['anthropic', 'google'],
            criteria: 'quality'
        });
    }

    /**
     * Retrieve relevant documents
     */
    async retrieve(query: string): Promise<VectorDocument[]> {
        const results = await vectorStore.search(query, this.config.topK);

        // Filter by minimum similarity if needed
        // (Note: VectorStore returns top-k, but we could add threshold filtering here)

        return results;
    }

    /**
     * Build augmented prompt with context
     */
    private buildPrompt(query: string, documents: VectorDocument[]): string {
        if (documents.length === 0) {
            return query;
        }

        const context = documents
            .map((doc, i) => {
                let text = `[Document ${i + 1}]\n${doc.content}`;

                if (this.config.includeMetadata && doc.metadata) {
                    text += `\nMetadata: ${JSON.stringify(doc.metadata)}`;
                }

                return text;
            })
            .join('\n\n---\n\n');

        return `Context Information:
${context}

---

Question: ${query}

Please answer the question using the context provided above. If the context doesn't contain relevant information, say so.`;
    }

    /**
     * Add knowledge to the knowledge base
     */
    async addKnowledge(content: string, metadata?: Record<string, any>): Promise<void> {
        await vectorStore.addDocument({
            id: crypto.randomUUID(),
            content,
            metadata,
        });
    }

    /**
     * Add multiple knowledge entries
     */
    async addKnowledgeBatch(entries: Array<{ content: string; metadata?: Record<string, any> }>): Promise<void> {
        const docs = entries.map((entry) => ({
            id: crypto.randomUUID(),
            content: entry.content,
            metadata: entry.metadata,
        }));

        await vectorStore.addDocuments(docs);
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<RAGConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// Global RAG instance
export const rag = new RAGPipeline();
