import { DTO } from '../../../../../../types/DTO';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../../../models/context/edge-connection.entity';
import { IdentityContext } from '../../../../../models/context/identity-context.entity/identity-context.entity';
import { PageRangeContext } from '../../../../../models/context/page-range-context/page-range.context.entity';
import { TimeRangeContext } from '../../../../../models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../../../models/context/types/EdgeConnectionContextType';
import { dummyUuid } from '../../../../../models/__tests__/utilities/dummyUuid';
import { AggregateType } from '../../../../../types/AggregateType';
import { ResourceType } from '../../../../../types/ResourceType';
import buildInvariantValidationErrorFactoryFunction from '../../../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import BothMembersInEdgeConnectionHaveSameRoleError from '../../../../errors/context/edgeConnections/BothMembersInEdgeConnectionHaveSameRoleError';
import ContextTypeIsNotAllowedForGivenResourceTypeError from '../../../../errors/context/edgeConnections/ContextTypeIsNotAllowedForGivenResourceTypeError';
import InvalidEdgeConnectionMemberRolesError from '../../../../errors/context/edgeConnections/InvalidEdgeConnectionMemberRolesError';
import InvalidNumberOfMembersInEdgeConnectionError from '../../../../errors/context/edgeConnections/InvalidNumberOfMembersInEdgeConnectionError';
import IncompatibleIdentityConnectionMembersError from '../../../../errors/context/IncompatibleIdentityConnectionMembersError';
import InvalidEdgeConnectionContextModelError from '../../../../errors/context/InvalidEdgeConnectionContextModelError';
import LonelyIdentityContextInEdgeconnectionError from '../../../../errors/context/LonelyIdentityContextInEdgeConnectionError';
import SelfConnectionCannotUseIdentityContextError from '../../../../errors/context/SelfConnectionCannotUseIdentityContextError';
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
        type: ResourceType.book,
        id: '1123',
    },
    role,
    context: validPageRangeContext,
});

const validTimeRangeContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,
    timeRange: {
        inPoint: 3789,
        outPoint: 3890,
    },
});

const buildValidTranscribedAudioConnectionMemberDto = (
    role: EdgeConnectionMemberRole
): DTO<EdgeConnectionMember<TimeRangeContext>> => ({
    compositeIdentifier: {
        type: ResourceType.transcribedAudio,
        id: '15',
    },
    role,
    context: validTimeRangeContext,
});

const validBookSelfConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.self,
    id: '12345',
    note: 'This is an awesome note',
    members: [buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.self)],
});

const validBookToTranscribedAudioDualConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.dual,
    members: [
        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.from),
        buildValidTranscribedAudioConnectionMemberDto(EdgeConnectionMemberRole.to),
    ],
    id: dummyUuid,
    note: 'These are both about bears',
}).toDTO();

const validBookBibliographicReferenceMemberWithIdentityContext: DTO<
    EdgeConnectionMember<IdentityContext>
> = {
    compositeIdentifier: {
        type: ResourceType.bibliographicReference,
        id: dummyUuid,
    },
    context: new IdentityContext(),
    role: EdgeConnectionMemberRole.from,
};

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
                    note: 'This is the note',
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
                    note: 'This is the note',
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
                                    inPoint: 3789,
                                    outPoint: 3890,
                                },
                            }),
                            compositeIdentifier: {
                                type: ResourceType.book,
                                id: '345',
                            },
                        },
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.from),
                    ],
                },
                expectedError: buildTopLevelError(validBookToTranscribedAudioDualConnection.id, [
                    new ContextTypeIsNotAllowedForGivenResourceTypeError(
                        EdgeConnectionContextType.timeRange,
                        ResourceType.book
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
                                    inPoint: 1200,
                                    outPoint: 1000,
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
            {
                description: 'When only one member in a dual connection uses the Identity Context',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.dual,
                    id: dummyUuid,
                    note: 'I do not get how identity context works!',
                    members: [
                        {
                            compositeIdentifier: {
                                type: ResourceType.bibliographicReference,
                                id: dummyUuid,
                            },
                            context: new IdentityContext(),
                            role: EdgeConnectionMemberRole.from,
                        },
                        buildValidBookEdgeConnectionMemberDto(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError(dummyUuid, [
                    new LonelyIdentityContextInEdgeconnectionError(),
                ]),
            },
            {
                description:
                    'when the from member in an identity connection is not a bibliographic reference',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.dual,
                    id: dummyUuid,
                    note: 'my from member should be a bibliographic reference, but it is not!',
                    members: [
                        {
                            role: EdgeConnectionMemberRole.from,
                            compositeIdentifier: {
                                type: ResourceType.book,
                                id: '6789',
                            },
                            context: new IdentityContext(),
                        },
                        {
                            role: EdgeConnectionMemberRole.to,
                            compositeIdentifier: {
                                type: ResourceType.bibliographicReference,
                                id: '390',
                            },
                            context: new IdentityContext(),
                        },
                    ],
                },
                expectedError: buildTopLevelError(dummyUuid, [
                    new IncompatibleIdentityConnectionMembersError({
                        fromType: ResourceType.book,
                        toType: ResourceType.bibliographicReference,
                    }),
                ]),
            },
            {
                description: 'when the members in an identity connection are not compatible',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.dual,
                    id: dummyUuid,
                    note: 'This book reference is having an identity crisis. Thinks it is a term.',
                    members: [
                        validBookBibliographicReferenceMemberWithIdentityContext,
                        {
                            role: EdgeConnectionMemberRole.to,
                            compositeIdentifier: {
                                type: ResourceType.term,
                                id: '5678',
                            },
                            context: new IdentityContext(),
                        },
                    ],
                },
                expectedError: buildTopLevelError(dummyUuid, [
                    /**
                     * For now, we don't have any resource types that can
                     * participate as the from member in an Identity Connection
                     * that can't participate with any `BibliographicReference` as
                     * the to member. Once we do, rewrite this test so we only see
                     * one error.
                     */
                    new ContextTypeIsNotAllowedForGivenResourceTypeError(
                        EdgeConnectionContextType.identity,
                        ResourceType.term
                    ),
                    new IncompatibleIdentityConnectionMembersError({
                        fromType: ResourceType.bibliographicReference,
                        toType: ResourceType.term,
                    }),
                ]),
            },
            {
                description: 'when a self connection member uses the Identity Context',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.self,
                    id: dummyUuid,
                    note: 'This self member is having an identity crisis!',
                    members: [
                        {
                            role: EdgeConnectionMemberRole.self,
                            compositeIdentifier: {
                                type: ResourceType.bibliographicReference,
                                id: '45',
                            },
                            context: new IdentityContext(),
                        },
                    ],
                },
                expectedError: buildTopLevelError(dummyUuid, [
                    new SelfConnectionCannotUseIdentityContextError(),
                ]),
            },
        ],
    },
];
