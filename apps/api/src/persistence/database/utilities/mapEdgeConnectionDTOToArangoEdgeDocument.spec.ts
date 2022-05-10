import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { DTO } from '../../../types/DTO';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import mapEdgeConnectionDTOToArangoEdgeDocument from './mapEdgeConnectionDTOToArangoEdgeDocument';

type TestCase = {
    description: string;
    input: DTO<EdgeConnection>;
    expectedResult: ArangoEdgeDocument;
};

const selfEdgeConnection = {
    id: '123',
    type: EdgeConnectionType.self,
    note: 'These pages are about bears',
    members: [
        {
            role: EdgeConnectionMemberRole.self,
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
};

const validPageRangeContext = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: ['1', '2', '3', 'iv'],
});

const buildValidBookEdgeConnectionMember = (
    role: EdgeConnectionMemberRole
): EdgeConnectionMember<PageRangeContext> => ({
    compositeIdentifier: {
        type: resourceTypes.book,
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
        type: resourceTypes.transcribedAudio,
        id: '15',
    },
    role,
    context: validTimeRangeContext,
});

const dualEdgeConnection = new EdgeConnection({
    type: EdgeConnectionType.dual,
    members: [
        buildValidBookEdgeConnectionMember(EdgeConnectionMemberRole.from),
        buildValidTranscribedAudioConnectionMember(EdgeConnectionMemberRole.to),
    ],
    id: '123',
    note: 'These are both about bears',
}).toDTO();

const testCases: TestCase[] = [
    {
        description: 'when given a self edge connection',
        input: selfEdgeConnection,
        expectedResult: {
            _from: 'books/24',
            _to: 'books/24',
            _key: '123',
            type: EdgeConnectionType.self,

            note: 'These pages are about bears',
            members: [
                {
                    role: EdgeConnectionMemberRole.self,
                    context: selfEdgeConnection.members[0].context,
                },
            ],
        },
    },
    {
        description: 'when given a dual edge connection',
        input: dualEdgeConnection,
        expectedResult: {
            _from: 'books/1123',
            _to: 'transcribed_audio/15',
            _key: '123',
            type: EdgeConnectionType.dual,

            note: 'These are both about bears',
            members: [
                {
                    role: EdgeConnectionMemberRole.from,
                    context: dualEdgeConnection.members[0].context,
                },
                {
                    role: EdgeConnectionMemberRole.to,
                    context: dualEdgeConnection.members[1].context,
                },
            ],
        },
    },
];

describe(`mapEdgeConnectionMembersToArangoDocumentDirectionAttributes`, () =>
    testCases.forEach(({ description, input, expectedResult }) => {
        describe(description, () => {
            it('should return the expected result', () => {
                // ACT
                const result = mapEdgeConnectionDTOToArangoEdgeDocument(input);

                expect(result).toEqual(expectedResult);
            });
        });
    }));
