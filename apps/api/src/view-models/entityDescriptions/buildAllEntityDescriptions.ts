import { EntityType } from '../../domain/types/entityTypes';

type EntityDescriptions = {
    [k in EntityType]: string;
};

const entityDescriptions: EntityDescriptions = {
    term: 'A term is a word, phrase, or sentence.',
    vocabularyList: [
        'A vocabulary list gathers terms with filters that apply',
        'within the context of the vocabulary list',
    ].join(' '),
    // would `transcribedAudio` be a better name?
    audioWithTranscript:
        'An audio with transcript is an audio recording accompanied by a transcription',
    book: 'A book is a digital representation of a text, organized into pages',
    tag: 'A tag is a classifier for an entity or a pair of related entities',
};

export const buildAllEntityDescriptions = () => entityDescriptions;
