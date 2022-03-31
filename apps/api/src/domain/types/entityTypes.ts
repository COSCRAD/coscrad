import { ValueType } from '../../lib/types/valueType';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';

export const entityTypes = {
  term: 'term',
  vocabularyList: 'vocabularyList',
  tag: 'tag',
} as const;

export type EntityType = ValueType<typeof entityTypes>;

export const isEntityType = (input: unknown): input is EntityType =>
  Object.values(entityTypes).includes(input as EntityType);

export type EntityTypeToInstance = {
  term: Term;
  vocabularyList: VocabularyList;
  tag: Tag;
};

/**
 * This represents the state of all domain models, excluding their `Connections`
 */
export type InMemorySnapshot = {
  [K in keyof EntityTypeToInstance]?: EntityTypeToInstance[K][];
};
