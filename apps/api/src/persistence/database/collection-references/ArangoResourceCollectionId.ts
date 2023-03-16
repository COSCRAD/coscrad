import { ValueType } from '../../../lib/types/valueType';

export const ArangoResourceCollectionId = {
    terms: 'terms',
    vocabulary_lists: 'vocabulary_lists',
    audio_items: 'audio_items',
    books: 'books',
    photographs: 'photographs',
    spatial_features: 'spatial_features',
    bibliographic_references: 'bibliographic_references',
    songs: 'songs',
    media_items: 'media_items',
    videos: 'videos',
} as const;

export type ArangoResourceCollectionId = ValueType<typeof ArangoResourceCollectionId>;

export const isArangoResourceCollectionId = (input: unknown): input is ArangoResourceCollectionId =>
    Object.values(ArangoResourceCollectionId).includes(input as ArangoResourceCollectionId);

export const getAllArangoResourceCollectionIDs = (): ArangoResourceCollectionId[] =>
    Object.values(ArangoResourceCollectionId);
