import { EdgeConnection } from 'apps/api/src/domain/models/context/edge-connection.entity';
import { FreeMultilineContext } from 'apps/api/src/domain/models/context/free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from 'apps/api/src/domain/models/context/general-context/general-context.entity';
import { PointContext } from 'apps/api/src/domain/models/context/point-context/point-context.entity';
import { TimeRangeContext } from 'apps/api/src/domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from 'apps/api/src/domain/models/context/types/EdgeConnectionContextType';
import { DTO } from 'apps/api/src/types/DTO';
import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { resourceTypes } from '../../../domain/types/resourceTypes';

const role = EdgeConnectionMemberRole.self;

const selfEdgeConnectionInstancesWithSpecificContext = [
    {
        tagIDs: ['1'],
        note: 'This first 4 letters of this term form a syllable that indicates this is a plant ',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: resourceTypes.term,
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
        tagIDs: ['2'],
        note: 'This page is about bears',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '24',
                    type: resourceTypes.book,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['ix'],
                }).toDTO(),
            },
        ],
    },
    {
        tagIDs: [],
        note: 'This is the first letter of the list name',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: 'vocabulary-list-id-2',
                    type: resourceTypes.vocabularyList,
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
        tagIDs: ['3'],
        note: 'there is a placename for this point at the base of the mountain',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '300',
                    type: resourceTypes.spatialFeature,
                },
                context: new GeneralContext(),
                // context: new PointContext({ point: [2.0, 5.0] }).toDTO(),
            },
        ],
    },
    // {
    //     tagIDs: ['3'],
    //     note: 'this is the path they took through the woods',
    //     members: [
    //         {
    //             role,
    //             compositeIdentifier: {
    //                 id: '300',
    //                 type: resourceTypes.spatialFeature,
    //             },
    //             context: new FreeMultilineContext({
    //                 lines: [
    //                     [
    //                         [1.2, 3.8],
    //                         [1.3, 3.9],
    //                         [1.4, 4.0],
    //                     ],
    //                 ],
    //             }).toDTO(),
    //         },
    //     ],
    // },
    {
        tagIDs: ['4'],
        note: 'this clip talks about songs',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '110',
                    type: resourceTypes.transcribedAudio,
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
        tagIDs: ['1'],
        note: 'this is the stem of the flower',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: resourceTypes.photograph,
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
        tagIDs: ['1'],
        note: 'this is the base of the flower',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: resourceTypes.photograph,
                },
                context: new PointContext({
                    type: EdgeConnectionContextType.point2D,
                    point: [0, 200],
                }),
            },
        ],
    },
    {
        tagIDs: ['2'],
        note: 'this section is the best part of an illustrated book about birds',
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '24',
                    type: resourceTypes.book,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['ix'],
                }),
            },
        ],
    },
].map((partialDTO) => ({ ...partialDTO, type: EdgeConnectionType.self }));

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

export default (): Omit<DTO<EdgeConnection>, 'id'>[] => [
    ...selfEdgeConnectionInstancesWithSpecificContext,
    ...selfEdgeConnectionsWithGeneralContext,
];
