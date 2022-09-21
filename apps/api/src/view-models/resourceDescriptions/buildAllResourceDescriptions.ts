import { getCoscradDataSchema } from '@coscrad/data-types';
import { ResourceType } from '../../domain/types/ResourceType';
import { getViewModelCtorFromAggregateType } from '../buildViewModelForResource/viewModels/utilities/ViewModelCtorFromResourceType/getViewModelCtorFromAggregateType';
import formatResourceType from '../presentation/formatAggregateType';
import { AggregateInfo } from './types/AggregateInfo';
import { AggregateTypeAndDescription } from './types/AggregateTypeAndDescription';

const resourceDescriptions: AggregateTypeAndDescription[] = [
    {
        type: ResourceType.term,
        description: 'A term is a word, phrase, or sentence.',
    },
    {
        type: ResourceType.vocabularyList,
        description: [
            'A vocabulary list gathers terms with filters that apply',
            'within the context of the vocabulary list.',
        ].join(' '),
    },
    {
        type: ResourceType.transcribedAudio,
        description:
            'A transcribed audio item includes a link to an audio recording and the associated transcript.',
    },
    {
        type: ResourceType.book,
        description: 'A book is a digital representation of a text, organized into pages.',
    },
    {
        type: ResourceType.photograph,
        description:
            'A photograph is a digital representation of an analog photograph and its metadata.',
    },
    {
        type: ResourceType.spatialFeature,
        description: 'A spatial feature may be a point, line, or polygon on the map.',
    },
    {
        type: ResourceType.bibliographicReference,
        description:
            'A bibliographic reference is a reference to, but not a digital representation of, a research resource.',
    },
    {
        type: ResourceType.song,
        description:
            'A song includes a link to an audio recording along with metadata and lyrics (when available).',
    },
    {
        type: ResourceType.mediaItem,
        description: 'A media item is a digital representation of an audio or video recording.',
    },
];

export const buildAllResourceDescriptions = (): AggregateInfo[] =>
    resourceDescriptions.map(({ type: resourceType, description }) => ({
        type: resourceType,
        description,
        label: formatResourceType(resourceType),
        schema: getCoscradDataSchema(getViewModelCtorFromAggregateType(resourceType)),
    }));
