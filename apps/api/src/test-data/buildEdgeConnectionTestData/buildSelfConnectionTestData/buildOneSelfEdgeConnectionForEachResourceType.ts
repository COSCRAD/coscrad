import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';

const role = EdgeConnectionMemberRole.self;

const edgeConnectionDTOs: Omit<DTO<EdgeConnection>, 'type' | 'id' | 'connectionType'>[] = [
    {
        note: buildMultilingualTextWithSingleItem(
            'This is a general note about this digital text',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '951',
                    type: ResourceType.digitalText,
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'This is a general note about this term',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: ResourceType.term,
                },
                context: new TextFieldContext({
                    type: EdgeConnectionContextType.textField,
                    languageCode: LanguageCode.English,
                    target: 'text',
                    charRange: [0, 1],
                }),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem('This page is about bears', LanguageCode.English),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '950',
                    type: ResourceType.digitalText,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['1'],
                }).toDTO(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem('This page is about bears', LanguageCode.English),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '951',
                    type: ResourceType.digitalText,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['1'],
                }).toDTO(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'This is the first letter of the list name',
            LanguageCode.Haida
        ),
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
                    languageCode: LanguageCode.Haida,
                    charRange: [0, 1],
                }).toDTO(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'there is a placename for this point at the base of the mountain',
            LanguageCode.English
        ),
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
        note: buildMultilingualTextWithSingleItem(
            'this clip talks about songs',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '110',
                    type: ResourceType.audioItem,
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPointMilliseconds: 11000,
                        outPointMilliseconds: 12950,
                    },
                }),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'this is the stem of the flower',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '2',
                    type: ResourceType.photograph,
                },
                context: new GeneralContext(),
            },
        ],
    },
    // TODO Restore this when supporting free-multiline context
    // {
    //     note: buildMultilingualTextWithSingleItem('this is the stem of the flower',LanguageCode.English),
    //     members: [
    //         {
    //             role,
    //             compositeIdentifier: {
    //                 id: '2',
    //                 type: ResourceType.photograph,
    //             },
    //             context: new FreeMultilineContext({
    //                 type: EdgeConnectionContextType.freeMultiline,
    //                 lines: (
    //                     [
    //                         [
    //                             [0, 200],
    //                             [100, 300],
    //                             [200, 400],
    //                             [250, 475],
    //                         ],
    //                     ] as [number, number][][]
    //                 ).map(
    //                     (pointsForLine) =>
    //                         new Line2DForContext({
    //                             points: pointsForLine.map(
    //                                 (point) => new Point2DForContext({ coordinates: point })
    //                             ),
    //                         })
    //                 ),
    //             }),
    //         },
    //     ],
    // },
    // TODO Support point2D context for Photograph
    // {
    //     note: buildMultilingualTextWithSingleItem('this is the base of the flower',LanguageCode.English),
    //     members: [
    //         {
    //             role,
    //             compositeIdentifier: {
    //                 id: '2',
    //                 type: ResourceType.photograph,
    //             },
    //             context: new PointContext({
    //                 type: EdgeConnectionContextType.point2D,
    //                 point: [0, 200],
    //             }),
    //         },
    //     ],
    // },
    {
        note: buildMultilingualTextWithSingleItem(
            'this section is the best part of an illustrated digitalText about birds',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '951',
                    type: ResourceType.digitalText,
                },
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['1'],
                }),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'found this in the archives',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '1',
                    type: ResourceType.bibliographicCitation,
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'digital representation of a journal article',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '950',
                    type: ResourceType.digitalText,
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem('this is a song', LanguageCode.English),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '1',
                    type: ResourceType.song,
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'important clip from the show',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '1',
                    type: ResourceType.mediaItem,
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPointMilliseconds: 650,
                        outPointMilliseconds: 1230,
                    },
                }),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'this digitalText is hard to track down',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '1',
                    type: ResourceType.bibliographicCitation,
                },
                context: new GeneralContext(),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem(
            'this clip talks about birds',
            LanguageCode.English
        ),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '223',
                    type: ResourceType.video,
                },
                context: new TimeRangeContext({
                    type: EdgeConnectionContextType.timeRange,
                    timeRange: {
                        inPointMilliseconds: 11000,
                        outPointMilliseconds: 12950,
                    },
                }),
            },
        ],
    },
    {
        note: buildMultilingualTextWithSingleItem('this playlist is awesome', LanguageCode.English),
        members: [
            {
                role,
                compositeIdentifier: {
                    id: '501',
                    type: ResourceType.playlist,
                },
                context: new GeneralContext(),
            },
        ],
    },
];
const selfEdgeConnectionInstancesWithSpecificContext = edgeConnectionDTOs.map((partialDTO) => ({
    ...partialDTO,
    connectionType: EdgeConnectionType.self,
}));

const selfEdgeConnectionsWithGeneralContext = selfEdgeConnectionInstancesWithSpecificContext
    .filter(({ members }) => !(members[0].context instanceof GeneralContext))
    .map((edgeConnection) => ({
        ...edgeConnection,
        members: [
            {
                ...edgeConnection.members[0],
                context: new GeneralContext().toDTO(),
            },
        ],
    }));

export default (uniqueIdOffset: number): EdgeConnection[] =>
    [...selfEdgeConnectionInstancesWithSpecificContext, ...selfEdgeConnectionsWithGeneralContext]
        .map((dto, index) => ({
            ...dto,
            id: `${index + uniqueIdOffset}`,
            type: AggregateType.note,
        }))
        .map((dto) => new EdgeConnection(dto));
