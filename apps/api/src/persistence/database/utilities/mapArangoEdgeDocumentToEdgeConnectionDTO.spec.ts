import { isDeepStrictEqual } from 'util';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { DTO } from '../../../types/DTO';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import mapArangoEdgeDocumentToEdgeConnectionDTO from './mapArangoEdgeDocumentToEdgeConnectionDTO';

type TestCase = {
    description: string;
    input: ArangoEdgeDocument;
    expectedResult: DTO<EdgeConnection>;
};

const timeRangeContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,
    timeRange: {
        inPoint: 0,
        outPoint: 3000,
    },
}).toDTO();

const generalContext = new GeneralContext();

const selfDocument: ArangoEdgeDocument = {
    _key: '5',
    _to: 'audio_items/55',
    _from: 'audio_items/55',
    type: AggregateType.note,
    eventHistory: [],
    connectionType: EdgeConnectionType.self,
    note: 'These pages are about deer',
    members: [
        {
            role: EdgeConnectionMemberRole.self,
            context: timeRangeContext,
        },
    ],
};

const selfEdgeConnection: DTO<EdgeConnection> = {
    id: '5',
    type: AggregateType.note,
    connectionType: EdgeConnectionType.self,
    note: 'These pages are about deer',
    members: [
        {
            role: EdgeConnectionMemberRole.self,
            compositeIdentifier: {
                id: '55',
                type: ResourceType.audioItem,
            },
            context: timeRangeContext,
        },
    ],
    eventHistory: [],
};

const dualEdgeDocument: ArangoEdgeDocument = {
    _key: '234',
    _to: 'books/11',
    _from: 'audio_items/55',
    connectionType: EdgeConnectionType.dual,
    eventHistory: [],
    type: AggregateType.note,
    note: 'the elder discusses this book in this part of the recording',
    members: [
        {
            role: EdgeConnectionMemberRole.to,
            context: generalContext,
        },
        {
            role: EdgeConnectionMemberRole.from,
            context: timeRangeContext,
        },
    ],
};

const dualEdgeConnection: DTO<EdgeConnection> = {
    type: AggregateType.note,
    connectionType: EdgeConnectionType.dual,
    id: '234',
    note: 'the elder discusses this book in this part of the recording',
    members: [
        {
            role: EdgeConnectionMemberRole.from,
            compositeIdentifier: {
                id: '55',
                type: ResourceType.audioItem,
            },
            context: timeRangeContext,
        },
        {
            role: EdgeConnectionMemberRole.to,
            compositeIdentifier: {
                id: '11',
                type: ResourceType.book,
            },
            context: generalContext,
        },
    ],
    eventHistory: [],
};

const testCases: TestCase[] = [
    {
        description: 'when given a document for a self edge connection',
        input: selfDocument,
        expectedResult: selfEdgeConnection,
    },
    {
        description: 'when given a document for a dual edge connection',
        input: dualEdgeDocument,
        expectedResult: dualEdgeConnection,
    },
];

testCases.forEach(({ description, input, expectedResult }) =>
    describe(description, () => {
        it('should return the expected result', () => {
            const result = mapArangoEdgeDocumentToEdgeConnectionDTO(input);

            /**
             * Note that when the members are the same, but in a different order
             * .toEqual returns a false positive. We may need a custom matcher
             * for this.
             */
            const everyMemberHasAMatch = result.members.every((member) =>
                expectedResult.members.some((expectedMember) =>
                    isDeepStrictEqual(member, expectedMember)
                )
            );

            expect(everyMemberHasAMatch).toBe(true);

            const resultWithoutMembers = {
                ...result,
                members: undefined,
            };

            const expectedResultWithoutMembers = {
                ...expectedResult,
                members: undefined,
            };

            expect(resultWithoutMembers).toEqual(expectedResultWithoutMembers);
        });
    })
);
