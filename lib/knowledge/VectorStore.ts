/**
 * Vector Store Implementation with Supabase pgvector
 * Persistent storage for embeddings
 */

import { supabase } from '../supabase';
import { llmRouter } from '@/lib/llm';

export interface VectorDocument {
    id: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, any>;
}

export class VectorStore {
    /**
     * Add a single document with embedding
     */
    async addDocument(doc: Omit<VectorDocument, 'embedding'>): Promise<void> {
        // Generate embedding
        const provider = llmRouter.getProvider('openai');
        if (!provider) {
            throw new Error('OpenAI provider not available for embeddings');
        }

        const embedding = await provider.embed(doc.content);

        // Store in Supabase
        const { error } = await supabase
            .from('embeddings')
            .insert({
                id: doc.id,
                content: doc.content,
                embedding: JSON.stringify(embedding), // Store as JSON
                metadata: doc.metadata || {},
            } as any);

        if (error) {
            throw new Error(`Failed to add document: ${error.message}`);
        }
    }

    /**
     * Add multiple documents
     */
    async addDocuments(docs: Omit<VectorDocument, 'embedding'>[]): Promise<void> {
        for (const doc of docs) {
            await this.addDocument(doc);
        }
    }

    /**
     * Search for similar documents using cosine similarity
     */
    async search(query: string, topK: number = 5): Promise<VectorDocument[]> {
        // Generate query embedding
        const provider = llmRouter.getProvider('openai');
        if (!provider) {
            throw new Error('OpenAI provider not available for embeddings');
        }

        const queryEmbedding = await provider.embed(query);

        // Use Supabase function for similarity search
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: JSON.stringify(queryEmbedding),
            match_threshold: 0.7,
            match_count: topK,
        } as any);

        if (error) {
            console.error('Vector search error:', error);
            return [];
        }

        return ((data as any[]) || []).map((item: any) => ({
            id: item.id,
            content: item.content,
            embedding: JSON.parse(item.embedding),
            metadata: item.metadata,
        }));
    }

    /**
     * Delete a document by ID
     */
    async deleteDocument(id: string): Promise<void> {
        const { error } = await supabase
            .from('embeddings')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }

    /**
     * Get all documents
     */
    async getAllDocuments(): Promise<VectorDocument[]> {
        const { data, error } = await supabase
            .from('embeddings')
            .select('*');

        if (error) {
            console.error('Failed to get documents:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            content: item.content,
            embedding: JSON.parse(item.embedding),
            metadata: item.metadata,
        }));
    }

    /**
     * Clear all documents
     */
    async clear(): Promise<void> {
        const { error } = await supabase
            .from('embeddings')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) {
            throw new Error(`Failed to clear documents: ${error.message}`);
        }
    }

    /**
     * Get store statistics
     */
    async getStats(): Promise<{ documentCount: number; usingVectorDB: boolean }> {
        try {
            const { count, error } = await supabase
                .from('embeddings')
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error('Failed to get stats:', error);
                return { documentCount: 0, usingVectorDB: false };
            }

            return {
                documentCount: count || 0,
                usingVectorDB: true
            };
        } catch (error) {
            return { documentCount: 0, usingVectorDB: false };
        }
    }
}

// Export singleton
export const vectorStore = new VectorStore();
