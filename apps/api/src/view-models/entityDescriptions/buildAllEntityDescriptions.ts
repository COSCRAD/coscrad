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
    tag: 'A tag is a classifier for an entity or a pair of related entities',
};

export const buildAllEntityDescriptions = () => entityDescriptions;
