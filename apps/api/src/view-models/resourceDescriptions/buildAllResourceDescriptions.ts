import buildViewModelPathForResourceType from '../../app/controllers/utilities/buildViewModelPathForResourceType';
import { ResourceType } from '../../domain/types/ResourceType';
import formatResourceType from '../presentation/formatAggregateType';

type ResourceTypeAndDescription = {
    resourceType: ResourceType;

    description: string;
};

export type ResourceDescription = ResourceTypeAndDescription & {
    link: string;

    // User-facing
    label: string;
};

const resourceDescriptions: ResourceTypeAndDescription[] = [
    {
        resourceType: ResourceType.term,
        description: 'A term is a word, phrase, or sentence.',
    },
    {
        resourceType: ResourceType.vocabularyList,
        description: [
            'A vocabulary list gathers terms with filters that apply',
            'within the context of the vocabulary list.',
        ].join(' '),
    },
    {
        resourceType: ResourceType.transcribedAudio,
        description:
            'A transcribed audio item includes a link to an audio recording and the associated transcript.',
    },
    {
        resourceType: ResourceType.book,
        description: 'A book is a digital representation of a text, organized into pages.',
    },
    {
        resourceType: ResourceType.photograph,
        description:
            'A photograph is a digital representation of an analog photograph and its metadata.',
    },
    {
        resourceType: ResourceType.spatialFeature,
        description: 'A spatial feature may be a point, line, or polygon on the map.',
    },
    {
        resourceType: ResourceType.bibliographicReference,
        description:
            'A bibliographic reference is a reference to, but not a digital representation of, a research resource.',
    },
    {
        resourceType: ResourceType.song,
        description:
            'A song includes a link to an audio recording along with metadata and lyrics (when available).',
    },
    {
        resourceType: ResourceType.mediaItem,
        description: 'A media item is a digital representation of an audio or video recording.',
    },
];

export const buildAllResourceDescriptions = (baseResourcesPath: string): ResourceDescription[] =>
    resourceDescriptions.map(({ resourceType, description }) => ({
        resourceType,
        description,
        label: formatResourceType(resourceType),
        link: `${baseResourcesPath}/${buildViewModelPathForResourceType(resourceType)}`,
    }));
