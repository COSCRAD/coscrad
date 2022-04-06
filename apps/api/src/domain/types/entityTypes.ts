import { ValueType } from '../../lib/types/valueType';
import { AudioWithTranscript } from '../models/audio-with-transcript/entities/audio-with-transcript.entity';
import { Book } from '../models/book/entities/book.entity';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';

export const entityTypes = {
    term: 'term',
    vocabularyList: 'vocabularyList',
    audioWithTranscript: 'audioWithTranscript',
    book: 'book',
    // TODO This doesn't belong here. It should be a stand-alone.
    tag: 'tag',
} as const;

export type EntityType = ValueType<typeof entityTypes>;

export const isEntityType = (input: unknown): input is EntityType =>
    Object.values(entityTypes).includes(input as EntityType);

export type EntityTypeToInstance = {
    term: Term;
    vocabularyList: VocabularyList;
    audioWithTranscript: AudioWithTranscript;
    book: Book;
    tag: Tag;
};

/**
 * This represents the state of all domain models, excluding their `Connections`
 */
export type InMemorySnapshot = {
    [K in EntityType]?: EntityTypeToInstance[K][];
};
