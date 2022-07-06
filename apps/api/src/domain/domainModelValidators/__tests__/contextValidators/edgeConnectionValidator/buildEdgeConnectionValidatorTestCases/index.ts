import { InternalError } from '../../../../../../lib/errors/InternalError';
import NoteMissingFromEdgeConnectionError from '../../../../../domainModelValidators/errors/context/edgeConnections/NoteMissingFromEdgeConnectionError';
import NullOrUndefinedEdgeConnectionDTOError from '../../../../../domainModelValidators/errors/context/edgeConnections/NullOrUndefindEdgeConnectionDTOError';
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
import BothMembersInEdgeConnectionHaveSameRoleError from '../../../../errors/context/edgeConnections/BothMembersInEdgeConnectionHaveSameRoleError';
import ContextTypeIsNotAllowedForGivenResourceTypeError from '../../../../errors/context/edgeConnections/ContextTypeIsNotAllowedForGivenResourceTypeError';
import InvalidEdgeConnectionDTOError from '../../../../errors/context/edgeConnections/InvalidEdgeConnectionDTOError';
import InvalidEdgeConnectionMemberRolesError from '../../../../errors/context/edgeConnections/InvalidEdgeConnectionMemberRolesError';
import InvalidNumberOfMembersInEdgeConnectionError from '../../../../errors/context/edgeConnections/InvalidNumberOfMembersInEdgeConnectionError';
import InvalidEdgeConnectionContextModelError from '../../../../errors/context/InvalidEdgeConnectionContextModelError';
import { EdgeConnectionValidatorTestCase } from '../types/EdgeConnectionValidatorTestCase';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidEdgeConnectionDTOError(innerErrors);

const validPageRangeContext = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: ['1', '2', '3', 'iv'],
});

const buildValidBookEdgeConnectionMember = (
    role: EdgeConnectionMemberRole
): EdgeConnectionMember<PageRangeContext> => ({
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

const buildValidTranscribedAudioConnectionMember = (
    role: EdgeConnectionMemberRole
): EdgeConnectionMember<TimeRangeContext> => ({
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
    members: [buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.self)],
});

const validBookToTranscribedAudioDualConnection = new EdgeConnection({
    type: AggregateType.note,
    connectionType: EdgeConnectionType.dual,
    members: [
        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.from),
        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
    ],
    id: '123',
    note: 'These are both about bears',
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
            {
                description: 'the DTO is null',
                invalidDTO: null,
                expectedError: new NullOrUndefinedEdgeConnectionDTOError(),
            },
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
                expectedError: buildTopLevelError([new NoteMissingFromEdgeConnectionError()]),
            },
            {
                description: 'the DTO is for a Self connection, but has 2 members',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.self),
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.self),
                    ],
                },
                expectedError: buildTopLevelError([
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.self, 2),
                ]),
            },
            {
                description: 'the DTO is for a Self connection, but has 0 members',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.self,
                    id: '123',

                    members: [],
                    note: 'This is the note',
                },
                expectedError: buildTopLevelError([
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.self, 0),
                ]),
            },
            {
                description: 'the DTO is for a Dual connection, but has 1 member',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError([
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.dual, 1),
                ]),
            },
            {
                description: 'the DTO is for a Dual connection, but has 0 members',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [],
                },
                expectedError: buildTopLevelError([
                    new InvalidNumberOfMembersInEdgeConnectionError(EdgeConnectionType.dual, 0),
                ]),
            },
            {
                description: 'the DTO is for a Self connection but its member has the role "to"',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError([
                    new InvalidEdgeConnectionMemberRolesError(EdgeConnectionType.self, [
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
                    ]),
                ]),
            },
            {
                description: 'the DTO is for a Self connection but its has the role "from"',
                invalidDTO: {
                    ...validBookSelfConnection,
                    members: [
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.from),
                    ],
                },
                expectedError: buildTopLevelError([
                    new InvalidEdgeConnectionMemberRolesError(EdgeConnectionType.self, [
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.from),
                    ]),
                ]),
            },
            {
                description:
                    'the DTO is for a Dual connection but one of the members has the role "self"',
                invalidDTO: {
                    type: AggregateType.note,
                    connectionType: EdgeConnectionType.dual,
                    id: '123',

                    members: [
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.self),
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.from),
                    ],
                    note: 'This is the note',
                },
                expectedError: buildTopLevelError([
                    new InvalidEdgeConnectionMemberRolesError(EdgeConnectionType.dual, [
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.self),
                    ]),
                ]),
            },
            {
                description:
                    'the DTO is for a Dual connection but both of the members have the role "to"',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.to),
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
                    ],
                },
                expectedError: buildTopLevelError([
                    new BothMembersInEdgeConnectionHaveSameRoleError(EdgeConnectionMemberRole.to),
                ]),
            },
            {
                description:
                    'the DTO is for a Dual connection but both of the members have the role "from"',
                invalidDTO: {
                    ...validBookToTranscribedAudioDualConnection,
                    members: [
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.from),
                        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.from),
                    ],
                },
                expectedError: buildTopLevelError([
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
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.from),
                    ],
                },
                expectedError: buildTopLevelError([
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
                        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.from),
                        {
                            ...buildValidTranscribedAudioConnectionMember(
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
                expectedError: buildTopLevelError([new InvalidEdgeConnectionContextModelError([])]),
            },
        ],
    },
];
