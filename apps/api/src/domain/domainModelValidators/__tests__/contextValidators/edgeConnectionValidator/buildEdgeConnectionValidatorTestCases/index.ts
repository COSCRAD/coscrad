import { LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../../../../../../domain/models/shared/multilingual-audio/multilingual-audio.entity';
import { DTO } from '../../../../../../types/DTO';
import buildInvariantValidationErrorFactoryFunction from '../../../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import { dummyUuid } from '../../../../../models/__tests__/utilities/dummyUuid';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../../../models/context/edge-connection.entity';
import { PageRangeContext } from '../../../../../models/context/page-range-context/page-range.context.entity';
import { TimeRangeContext } from '../../../../../models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../../../models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../../../../types/AggregateType';
import { ResourceType } from '../../../../../types/ResourceType';
import InvalidEdgeConnectionContextModelError from '../../../../errors/context/InvalidEdgeConnectionContextModelError';
import BothMembersInEdgeConnectionHaveSameRoleError from '../../../../errors/context/edgeConnections/BothMembersInEdgeConnectionHaveSameRoleError';
import ContextTypeIsNotAllowedForGivenResourceTypeError from '../../../../errors/context/edgeConnections/ContextTypeIsNotAllowedForGivenResourceTypeError';
import InvalidEdgeConnectionMemberRolesError from '../../../../errors/context/edgeConnections/InvalidEdgeConnectionMemberRolesError';
import InvalidNumberOfMembersInEdgeConnectionError from '../../../../errors/context/edgeConnections/InvalidNumberOfMembersInEdgeConnectionError';
import { EdgeConnectionValidatorTestCase } from '../types/EdgeConnectionValidatorTestCase';

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(AggregateType.note);

const validPageRangeContext = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: ['1', '2', '3', 'iv'],
});

const buildValidBookEdgeConnectionMemberDto = (
    role: EdgeConnectionMemberRole
): DTO<EdgeConnectionMember<PageRangeContext>> => ({
    compositeIdentifier: {
        type: ResourceType.digitalText,
        id: '1123',
    },
    role,
    context: validPageRangeContext,
});

const validTimeRangeContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,
    timeRange: {
        inPointMilliseconds: 3789,
        outPointMilliseconds: 3890,
    },
});

const buildValidTranscribedAudioConnectionMemberDto = (
    role: EdgeConnectionMemberRole
): DTO<EdgeConnectionMember<TimeRangeContext>> => ({
    compositeIdentifier: {
        type: ResourceType.audioItem,
        id: '15',
    },
    role,
    context: validTimeRangeContext,
});

const audioItemId = buildDummyUuid(555);

const languageCodeForAudio = LanguageCode.English;

const validBookSelfConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.self,
    id: '12345',
    note: buildMultilingualTextWithSingleItem('This is an awesome note', LanguageCode.English),
    members: [buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.self)],
    audioForNote: MultilingualAudio.buildEmpty().addAudio(
        audioItemId,
        languageCodeForAudio
    ) as MultilingualAudio,
});

const validBookToTranscribedAudioDualConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.dual,
    members: [
        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.from),
        buildValidTranscribedAudioConnectionMemberDto(EdgeConnectionMemberRole.to),
    ],
    id: dummyUuid,
    note: buildMultilingualTextWithSingleItem('These are both about bears', LanguageCode.English),
    audioForNote: MultilingualAudio.buildEmpty().addAudio(
        audioItemId,
        languageCodeForAudio
    ) as MultilingualAudio,
}).toDTO();

export default (): EdgeConnectionValidatorTestCase[] => [
    {
        validCases: [
            {
                dto: validBookToTranscribedAudioDualConnection,
            },
            {
                dto: validBookSelfConnection,
            },
        ],
        invalidCases: [
            /**
             * TODO [https://www.pivotaltracker.com/story/show/183014320]
             * We need to test at a higher level that a null or undefined
             * DTO leads to the appropriate error from the factory.
             */
            /**
             * TODO
             *
             * We need to update this test data once we can seed edge
             * connections in our test data builder. At that point, we can
             * pass the actual members' context through to the lower level
             * context model validation layer.
             *
             * Right now, I am ignoring validation of the `members` and their context
             * so that I can solidify the high level design.
             */
            {
                description: 'the DTO is missing a note',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    note: null,
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    /**
                     * As the test is set up, it's not easy to check inner errors
                     * generated by our validation lib. We should fix this.
                     */
                ]),
            },
            {
                description: 'the DTO is for a Self connection, but has 2 members',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.self),
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.self),
                    ],
                },
                expectedError: buildTopLevelError(validBookSelfConnection.id, [
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.self, 2),
                ]),
            },
            {
                description: 'the DTO is for a Self connection, but has 0 members',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.self,
                    id: dummyUuid,

                    members: [],
                    note: buildMultilingualTextWithSingleItem(
                        'This is the note',
                        LanguageCode.English
                    ),
                    audioForNote: MultilingualAudio.buildEmpty().addAudio(
                        audioItemId,
                        languageCodeForAudio
                    ) as MultilingualAudio,
                },
                expectedError: buildTopLevelError(dummyUuid, [
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.self, 0),
                ]),
            },
            {
                description: 'the DTO is for a Dual connection, but has 1 member',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidTranscribedAudioConnectionMemberDto(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.dual, 1),
                ]),
            },
            {
                description: 'the DTO is for a Dual connection, but has 0 members',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [],
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.dual, 0),
                ]),
            },
            {
                description: 'the DTO is for a Self connection but its member has the role "to"',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        buildValidTranscribedAudioConnectionMemberDto(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError(validBookSelfConnection.id, [
                    new InvalidEdgeConnectionMemberRolesError(EdgeConnectionType.self, [
                        buildValidTranscribedAudioConnectionMemberDto(EdgeConnectionMemberRole.to),
                    ]),
                ]),
            },
            {
                description: 'the DTO is for a Self connection but its has the role "from"',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        buildValidTranscribedAudioConnectionMemberDto(
                            EdgeConnectionMemberRole.from
                        ),
                    ],
                },
                expectedError: buildTopLevelError(validBookSelfConnection.id, [
                    new InvalidEdgeConnectionMemberRolesError(EdgeConnectionType.self, [
                        buildValidTranscribedAudioConnectionMemberDto(
                            EdgeConnectionMemberRole.from
                        ),
                    ]),
                ]),
            },
            {
                description:
                    'the DTO is for a Dual connection but one of the members has the role "self"',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.dual,
                    id: dummyUuid,

                    members: [
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.self),
                        buildValidTranscribedAudioConnectionMemberDto(
                            EdgeConnectionMemberRole.from
                        ),
                    ],
                    note: buildMultilingualTextWithSingleItem(
                        'This is the note',
                        LanguageCode.English
                    ),
                    audioForNote: MultilingualAudio.buildEmpty().addAudio(
                        audioItemId,
                        languageCodeForAudio
                    ) as MultilingualAudio,
                },
                expectedError: buildTopLevelError(dummyUuid, [
                    new InvalidEdgeConnectionMemberRolesError(EdgeConnectionType.dual, [
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.self),
                    ]),
                ]),
            },
            {
                description:
                    'the DTO is for a Dual connection but both of the members have the role "to"',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.to),
                        buildValidTranscribedAudioConnectionMemberDto(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new BothMembersInEdgeConnectionHaveSameRoleError(EdgeConnectionMemberRole.to),
                ]),
            },
            {
                description:
                    'the DTO is for a Dual connection but both of the members have the role "from"',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.from),
                        buildValidTranscribedAudioConnectionMemberDto(
                            EdgeConnectionMemberRole.from
                        ),
                    ],
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new BothMembersInEdgeConnectionHaveSameRoleError(EdgeConnectionMemberRole.from),
                ]),
            },
            {
                description: 'the context type is not a registered context type',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        {
                            ...validBookSelfConnection.members[0],
                            context: {
                                type: 'BOGUS CONTEXT TYPE',
                            },
                        },
                    ],
                },
                expectedError: buildTopLevelError(validBookSelfConnection.id, []),
            },
            {
                description:
                    'the context type is not consistent with the resource type in the composite id',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        {
                            role: EdgeConnectionMemberRole.to,
                            context: new TimeRangeContext({
                                type: EdgeConnectionContextType.timeRange,
                                timeRange: {
                                    inPointMilliseconds: 3789,
                                    outPointMilliseconds: 3890,
                                },
                            }),
                            compositeIdentifier: {
                                type: ResourceType.digitalText,
                                id: '345',
                            },
                        },
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.from),
                    ],
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new ContextTypeIsNotAllowedForGivenResourceTypeError(
                        EdgeConnectionContextType.timeRange,
                        ResourceType.digitalText
                    ),
                ]),
            },
            {
                description:
                    'When the "to" member context does not satisfy its context model invariants',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.from),
                        {
                            ...buildValidTranscribedAudioConnectionMemberDto(
                                EdgeConnectionMemberRole.to
                            ),
                            context: new TimeRangeContext({
                                type: EdgeConnectionContextType.timeRange,
                                timeRange: {
                                    inPointMilliseconds: 1200,
                                    outPointMilliseconds: 1000,
                                },
                            }).toDTO(),
                        },
                    ],
                },
                /**
                 * **note:** we don't want to validate the inner errors of
                 * `InvalidEdgeConnectionContextModelError` here, as
                 * this is an integration test. We just want to make sure it indeed
                 * picks up on the top level error. Getting these inner errors right
                 * should be tested in `edgeConnectionContextValidator.spec.ts`
                 */
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new InvalidEdgeConnectionContextModelError([]),
                ]),
            },
        ],
    },
];
