/**
 * Knowledge Base Manager
 * Manages documents, categories, and knowledge organization
 */

import { vectorStore, type VectorDocument } from './VectorStore';

export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    source?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}

export class KnowledgeBase {
    private entries: Map<string, KnowledgeEntry> = new Map();

    /**
     * Add knowledge entry
     */
    async addEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const id = crypto.randomUUID();
        const now = new Date();

        const knowledgeEntry: KnowledgeEntry = {
            ...entry,
            id,
            createdAt: now,
            updatedAt: now,
        };

        this.entries.set(id, knowledgeEntry);

        // Add to vector store for semantic search
        await vectorStore.addDocument({
            id,
            content: `${entry.title}\n\n${entry.content}`,
            metadata: {
                title: entry.title,
                category: entry.category,
                tags: entry.tags,
                source: entry.source,
            },
        });

        return id;
    }

    /**
     * Update knowledge entry
     */
    async updateEntry(id: string, updates: Partial<Omit<KnowledgeEntry, 'id' | 'createdAt'>>): Promise<boolean> {
        const entry = this.entries.get(id);

        if (!entry) {
            return false;
        }

        const updated: KnowledgeEntry = {
            ...entry,
            ...updates,
            updatedAt: new Date(),
        };

        this.entries.set(id, updated);

        // Update in vector store
        if (updates.title || updates.content) {
            await vectorStore.deleteDocument(id);
            await vectorStore.addDocument({
                id,
                content: `${updated.title}\n\n${updated.content}`,
                metadata: {
                    title: updated.title,
                    category: updated.category,
                    tags: updated.tags,
                    source: updated.source,
                },
            });
        }

        return true;
    }

    /**
     * Delete knowledge entry
     */
    async deleteEntry(id: string): Promise<boolean> {
        const deleted = this.entries.delete(id);

        if (deleted) {
            await vectorStore.deleteDocument(id);
        }

        return deleted;
    }

    /**
     * Get entry by ID
     */
    getEntry(id: string): KnowledgeEntry | undefined {
        return this.entries.get(id);
    }

    /**
     * Search entries by text
     */
    async search(query: string, limit: number = 10): Promise<KnowledgeEntry[]> {
        const docs = await vectorStore.search(query, limit);

        return docs
            .map((doc) => this.entries.get(doc.id))
            .filter((entry): entry is KnowledgeEntry => entry !== undefined);
    }

    /**
     * Get entries by category
     */
    getByCategory(category: string): KnowledgeEntry[] {
        return Array.from(this.entries.values()).filter(
            (entry) => entry.category === category
        );
    }

    /**
     * Get entries by tag
     */
    getByTag(tag: string): KnowledgeEntry[] {
        return Array.from(this.entries.values()).filter(
            (entry) => entry.tags?.includes(tag)
        );
    }

    /**
     * List all categories
     */
    getCategories(): string[] {
        const categories = new Set<string>();

        this.entries.forEach((entry) => {
            if (entry.category) {
                categories.add(entry.category);
            }
        });

        return Array.from(categories);
    }

    /**
     * List all tags
     */
    getTags(): string[] {
        const tags = new Set<string>();

        this.entries.forEach((entry) => {
            entry.tags?.forEach((tag) => tags.add(tag));
        });

        return Array.from(tags);
    }

    /**
     * Get all entries
     */
    getAllEntries(): KnowledgeEntry[] {
        return Array.from(this.entries.values());
    }

    /**
     * Import entries from JSON
     */
    async importFromJSON(json: string): Promise<number> {
        try {
            const data = JSON.parse(json);
            let imported = 0;

            if (Array.isArray(data)) {
                for (const entry of data) {
                    await this.addEntry(entry);
                    imported++;
                }
            }

            return imported;
        } catch (error) {
            console.error('Error importing knowledge:', error);
            return 0;
        }
    }

    /**
     * Export entries to JSON
     */
    exportToJSON(): string {
        return JSON.stringify(this.getAllEntries(), null, 2);
    }

    /**
     * Get statistics
     */
    getStats() {
        const entries = this.getAllEntries();

        return {
            totalEntries: entries.length,
            categories: this.getCategories().length,
            tags: this.getTags().length,
            avgContentLength: entries.reduce((sum, e) => sum + e.content.length, 0) / entries.length,
        };
    }
}

// Global knowledge base instance
export const knowledgeBase = new KnowledgeBase();
