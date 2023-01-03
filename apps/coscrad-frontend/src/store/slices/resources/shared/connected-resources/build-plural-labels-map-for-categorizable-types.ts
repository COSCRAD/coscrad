import { CategorizableType } from '@coscrad/api-interfaces';

type CategorizableTypeAndPluralLabel = { [K in CategorizableType]: string };

/**
 * This would be better as part of the `Resource Info`
 */
const categorizableTypeAndPluralLabel: CategorizableTypeAndPluralLabel = {
    // Resources
    [CategorizableType.bibliographicReference]: 'Bibliographic References',
    [CategorizableType.book]: 'Books',
    [CategorizableType.mediaItem]: 'Media Items',
    [CategorizableType.photograph]: 'Photographs',

    [CategorizableType.song]: 'Songs',
    [CategorizableType.spatialFeature]: 'Spatial Features',
    [CategorizableType.term]: 'Terms',
    [CategorizableType.transcribedAudio]: 'Audio Transcripts',
    [CategorizableType.vocabularyList]: 'Vocabulary Lists',
    // Notes
    [CategorizableType.note]: 'Notes',
};

export const buildPluralLabelsMapForCategorizableTypes = () =>
    /**
     * Object.entries is taken by the compiler to return an iterable over [string,string]
     * not [CategorizableType,string] here.
     */
    new Map(Object.entries(categorizableTypeAndPluralLabel)) as Map<CategorizableType, string>;