import buildViewModelPathForResourceType from '../../app/controllers/utilities/buildViewModelPathForResourceType';
import { ResourceType, resourceTypes } from '../../domain/types/resourceTypes';

type ResourceDescription = {
    resourceType: ResourceType;
    description: string;
};

export type ResourceDescriptionAndLink = ResourceDescription & {
    link: string;
};

const resourceDescriptions: ResourceDescription[] = [
    {
        resourceType: resourceTypes.term,
        description: 'A term is a word, phrase, or sentence.',
    },
    {
        resourceType: resourceTypes.vocabularyList,
        description: [
            'A vocabulary list gathers terms with filters that apply',
            'within the context of the vocabulary list',
        ].join(' '),
    },
    {
        resourceType: resourceTypes.transcribedAudio,
        description:
            'An audio with transcript is an audio recording accompanied by a transcription',
    },
    {
        resourceType: resourceTypes.book,
        description: 'A book is a digital representation of a text, organized into pages',
    },
    {
        resourceType: resourceTypes.photograph,
        description:
            'A Photograph is a digital representation of an analog photograph and its metadata',
    },
    {
        resourceType: resourceTypes.spatialFeature,
        description: 'A spatial feature may be a point, line, or polygon on the map',
    },
    {
        resourceType: resourceTypes.bibliographicReference,
        description:
            'A bibliographic reference is a reference to, but not a digital representation of, a research resource',
    },
    {
        resourceType: resourceTypes.song,
        description: 'A song includes lyrics and url link to audio recording.',
    },
    {
        resourceType: resourceTypes.mediaItem,
        description: 'A media item includes a link to and data for an audio or video recording',
    },
];

export const buildAllResourceDescriptions = (
    baseResourcesPath: string
): ResourceDescriptionAndLink[] =>
    resourceDescriptions.map(({ resourceType, description }) => ({
        resourceType,
        description,
        link: `${baseResourcesPath}/${buildViewModelPathForResourceType(resourceType)}`,
    }));
