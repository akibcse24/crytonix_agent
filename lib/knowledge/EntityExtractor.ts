/**
 * Entity Extraction and Relationship Mapping
 * Extracts entities from text and builds relationship graphs
 */

import { llmRouter } from '@/lib/llm';
import type { LLMParams } from '@/lib/types/llm.types';

export interface Entity {
    name: string;
    type: 'person' | 'organization' | 'location' | 'date' | 'event' | 'product' | 'concept' | 'other';
    mentions: number;
    context?: string;
}

export interface EntityRelation {
    source: string;
    target: string;
    type: 'related_to' | 'part_of' | 'located_in' | 'works_for' | 'created_by' | 'caused_by' | 'custom';
    strength: number; // 0-1
    context?: string;
}

export class EntityExtractor {
    private entities: Map<string, Entity> = new Map();
    private relations: EntityRelation[] = [];

    /**
     * Extract entities from text using LLM
     */
    async extractEntities(text: string): Promise<Entity[]> {
        const prompt = `Extract named entities from the following text. Return a JSON array of entities with their types.

Entity types: person, organization, location, date, event, product, concept, other

Text: ${text}

Format: [{"name": "Entity Name", "type": "person", "context": "brief context"}]

Only return the JSON array, no other text.`;

        try {
            const response = await llmRouter.generate({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at named entity recognition. Extract entities accurately.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                maxTokens: 1000,
            });

            const content = response.content || '[]';
            const extracted: Entity[] = JSON.parse(content);

            // Update entity map
            extracted.forEach((entity) => {
                const existing = this.entities.get(entity.name);

                if (existing) {
                    existing.mentions++;
                    this.entities.set(entity.name, existing);
                } else {
                    this.entities.set(entity.name, { ...entity, mentions: 1 });
                }
            });

            return extracted;
        } catch (error) {
            console.error('Error extracting entities:', error);
            return [];
        }
    }

    /**
     * Extract relationships between entities
     */
    async extractRelations(text: string, entities: Entity[]): Promise<EntityRelation[]> {
        if (entities.length < 2) {
            return [];
        }

        const entityNames = entities.map((e) => e.name).join(', ');
        const prompt = `Given these entities: ${entityNames}

Analyze the following text and identify relationships between them.

Text: ${text}

Return a JSON array of relationships with this format:
[{"source": "EntityA", "target": "EntityB", "type": "works_for", "strength": 0.8}]

Relationship types: related_to, part_of, located_in, works_for, created_by, caused_by, custom

Only return the JSON array.`;

        try {
            const response = await llmRouter.generate({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at relationship extraction.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                maxTokens: 1000,
            });

            const content = response.content || '[]';
            const relations: EntityRelation[] = JSON.parse(content);

            this.relations.push(...relations);

            return relations;
        } catch (error) {
            console.error('Error extracting relations:', error);
            return [];
        }
    }

    /**
     * Process text and extract both entities and relations
     */
    async process(text: string): Promise<{ entities: Entity[]; relations: EntityRelation[] }> {
        const entities = await this.extractEntities(text);
        const relations = await this.extractRelations(text, entities);

        return { entities, relations };
    }

    /**
     * Get entity by name
     */
    getEntity(name: string): Entity | undefined {
        return this.entities.get(name);
    }

    /**
     * Get all entities
     */
    getAllEntities(): Entity[] {
        return Array.from(this.entities.values());
    }

    /**
     * Get entities by type
     */
    getEntitiesByType(type: Entity['type']): Entity[] {
        return this.getAllEntities().filter((e) => e.type === type);
    }

    /**
     * Get relations for an entity
     */
    getRelations(entityName: string): EntityRelation[] {
        return this.relations.filter(
            (rel) => rel.source === entityName || rel.target === entityName
        );
    }

    /**
     * Get all relations
     */
    getAllRelations(): EntityRelation[] {
        return [...this.relations];
    }

    /**
     * Build knowledge graph representation
     */
    buildGraph(): { nodes: Entity[]; edges: EntityRelation[] } {
        return {
            nodes: this.getAllEntities(),
            edges: this.getAllRelations(),
        };
    }

    /**
     * Export graph as JSON
     */
    exportGraph(): string {
        return JSON.stringify(this.buildGraph(), null, 2);
    }

    /**
     * Clear all entities and relations
     */
    clear(): void {
        this.entities.clear();
        this.relations = [];
    }

    /**
     * Get statistics
     */
    getStats() {
        const entities = this.getAllEntities();
        const typeCount: Record<string, number> = {};

        entities.forEach((entity) => {
            typeCount[entity.type] = (typeCount[entity.type] || 0) + 1;
        });

        return {
            totalEntities: entities.length,
            totalRelations: this.relations.length,
            typeDistribution: typeCount,
            avgMentions: entities.reduce((sum, e) => sum + e.mentions, 0) / entities.length,
        };
    }
}

// Global entity extractor instance
export const entityExtractor = new EntityExtractor();
