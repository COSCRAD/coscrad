import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildTestData from '../../../test-data/buildTestData';
import { DTO } from '../../../types/DTO';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import mapArangoEdgeDocumentToEdgeConnectionDTO from './mapArangoEdgeDocumentToEdgeConnectionDTO';
import mapDatabaseDTOToEntityDTO from './mapDatabaseDTOToEntityDTO';
import mapEdgeConnectionDTOToArangoEdgeDocument from './mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO, { DatabaseDTO } from './mapEntityDTOToDatabaseDTO';

type TestCase<TInput, UOutput> = {
    description: string;
    forwardLabel: string;
    reverseLabel: string;
    forward: (input: TInput) => UOutput;
    reverse: (input: UOutput) => TInput;
    inputs: TInput[];
    outputs: UOutput[];
};

const testData = buildTestData();

const edgeConnections: DTO<EdgeConnection>[] = [
    {
        type: EdgeConnectionType.self,
        id: '1',
        note: 'the note',
        members: [
            {
                role: EdgeConnectionMemberRole.self,
                context: new PageRangeContext({
                    type: EdgeConnectionContextType.pageRange,
                    pageIdentifiers: ['134', 'ix'],
                }),
                compositeIdentifier: {
                    type: ResourceType.book,
                    id: '5353',
                },
            },
        ],
    },
    ...testData.connections.map((connection) => connection.toDTO()),
];

const resourceDTOs = Object.values(testData.resources).flatMap((instances) =>
    instances.map((instance) => instance.toDTO())
);

const edgeDocumentToDTOTestCase: TestCase<ArangoEdgeDocument, DTO<EdgeConnection>> = {
    description: 'when mapping an Arango edge document to an Edge Connection DTO',
    forwardLabel: 'edge document => DTO',
    reverseLabel: 'DTO -> edge document',
    forward: mapArangoEdgeDocumentToEdgeConnectionDTO,
    reverse: mapEdgeConnectionDTOToArangoEdgeDocument,
    /**
     * Let's omit this direction. Building up dummy documents requires either
     * - reproducing the implementation (low value test)
     * - more effort than the marginal improvement in test coverage deserves
     */
    inputs: [],
    outputs: edgeConnections,
};

const resourceDocumentToDTOTestCase: TestCase<DatabaseDTO, DTO<HasAggregateId>> = {
    description: 'when mapping an Arango resource document to a Resource DTO',
    forwardLabel: 'document => DTO',
    reverseLabel: 'DTO => document',
    forward: mapDatabaseDTOToEntityDTO,
    reverse: mapEntityDTOToDatabaseDTO,
    /**
     * Let's omit this direction. Building up dummy documents requires either
     * - reproducing the implementation (low value test)
     * - more effort than the marginal improvement in test coverage deserves
     */
    inputs: [],
    outputs: resourceDTOs,
};

const testCases = [edgeDocumentToDTOTestCase, resourceDocumentToDTOTestCase];

testCases.forEach(
    ({ description, forward, reverse, inputs, outputs, forwardLabel, reverseLabel }) =>
        describe(description, () => {
            describe(`when mapping: ${forwardLabel}`, () => {
                inputs.forEach((input) =>
                    it('applying the forward then reverse mapping should leave the input unchanged', () => {
                        const result = reverse(forward(input));

                        expect(result).toBe(input);
                    })
                );
            });

            describe(`when mapping: ${reverseLabel}`, () => {
                outputs.forEach((output) =>
                    it('applying the reverse then forward mapping should leave the input unchanged', () => {
                        const result = forward(reverse(output));

                        expect(result).toEqual(output);
                    })
                );
            });
        })
);
