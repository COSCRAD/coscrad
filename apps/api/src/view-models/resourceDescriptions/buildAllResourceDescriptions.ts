import { ResourceType } from '../../domain/types/resourceTypes';

type ResourceDescriptions = {
    [k in ResourceType]: string;
};

const resourceDescriptions: ResourceDescriptions = {
    term: 'A term is a word, phrase, or sentence.',
    vocabularyList: [
        'A vocabulary list gathers terms with filters that apply',
        'within the context of the vocabulary list',
    ].join(' '),
    // would `transcribedAudio` be a better name?
    transcribedAudio:
        'An audio with transcript is an audio recording accompanied by a transcription',
    book: 'A book is a digital representation of a text, organized into pages',
    photograph: 'A Photograph is a digital representation of an analog photograph and its metadata',
    spatialFeature: 'A spatial feature may be a point, line, or polygon on the map',
    tag: 'A tag is a classifier for an entity or a pair of related entities',
};

export const buildAllResourceDescriptions = () => resourceDescriptions;
