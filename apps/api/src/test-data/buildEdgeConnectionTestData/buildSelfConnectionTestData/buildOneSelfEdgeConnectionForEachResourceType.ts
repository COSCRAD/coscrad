import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { FreeMultilineContext } from '../../../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { PointContext } from '../../../domain/models/context/point-context/point-context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';

const role = EdgeConnectionMemberRole.self;

const edgeConnectionDTOs: Omit<DTO<EdgeConnection>, 'type' | 'id'>[] = [
    {
        note: 'This first 4 letters of this term form a syllable that indicates this is a plant ',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: ResourceType.term,
                },
                context: new TextFieldContext({
                    type: EdgeConnectionContextType.textField,
                    target: 'term',
                    charRange: [0, 3],
                }).toDTO(),
            },
        ],
    },
    {
        note: 'This page is about bears',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '24',
                    type: ResourceType.book,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['ix'],
                }).toDTO(),
            },
        ],
    },
    {
        note: 'This is the first letter of the list name',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: ResourceType.vocabularyList,
                },
                context: new TextFieldContext({
                    type: EdgeConnectionContextType.textField,
                    target: 'name',
                    charRange: [0, 1],
                }).toDTO(),
            },
        ],
    },
    {
        note: 'there is a placename for this point at the base of the mountain',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '300',
                    type: ResourceType.spatialFeature,
                },
                context: new GeneralContext(),
                // context: new PointContext({ point: [2.0, 5.0] }).toDTO(),
            },
        ],
    },
    {
        note: 'this clip talks about songs',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '110',
                    type: ResourceType.transcribedAudio,
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPoint: 11000,
                        outPoint: 12950,
                    },
                }),
            },
        ],
    },
    {
        note: 'this is the stem of the flower',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: ResourceType.photograph,
                },
                context: new FreeMultilineContext({
                    type: EdgeConnectionContextType.freeMultiline,
                    lines: [
                        [
                            [0, 200],
                            [100, 300],
                            [200, 400],
                            [250, 475],
                        ],
                    ],
                }),
            },
        ],
    },
    {
        note: 'this is the base of the flower',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: ResourceType.photograph,
                },
                context: new PointContext({
                    type: EdgeConnectionContextType.point2D,
                    point: [0, 200],
                }),
            },
        ],
    },
    {
        note: 'this section is the best part of an illustrated book about birds',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '24',
                    type: ResourceType.book,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['ix'],
                }),
            },
        ],
    },
    {
        note: 'found this in the archives',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '1',
                    type: ResourceType.bibliographicReference,
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        note: 'this is a song',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '1',
                    type: ResourceType.song,
                },
                context: new TimeRangeContext({
                    timeRange: {
                        inPoint: 300,
                        outPoint: 500,
                    },
                    type: EdgeConnectionContextType.timeRange,
                }),
            },
        ],
    },
];
const selfEdgeConnectionInstancesWithSpecificContext = edgeConnectionDTOs.map((partialDTO) => ({
    ...partialDTO,
    type: EdgeConnectionType.self,
}));

const selfEdgeConnectionsWithGeneralContext = selfEdgeConnectionInstancesWithSpecificContext.map(
    (edgeConnection) => ({
        ...edgeConnection,
        members: [
            {
                ...edgeConnection.members[0],
                context: new GeneralContext().toDTO(),
            },
        ],
    })
);

export default (uniqueIdOffset: number): EdgeConnection[] =>
    [...selfEdgeConnectionInstancesWithSpecificContext, ...selfEdgeConnectionsWithGeneralContext]
        .map((dto, index) => ({
            ...dto,
            id: `${index + uniqueIdOffset}`,
        }))
        .map((dto) => new EdgeConnection(dto));
