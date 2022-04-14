import { EdgeConnectionType } from 'apps/api/src/domain/models/context/edge-connection.entity';
import NoteMissingFromEdgeConnectionError from '../../../../../domainModelValidators/errors/context/edgeConnections/NoteMissingFromEdgeConnectionError';
import NullOrUndefinedEdgeConnectionDTOError from '../../../../../domainModelValidators/errors/context/edgeConnections/NullOrUndefindEdgeConnectionDTOError';
import InvalidEdgeConnectionDTOError from '../../../../errors/context/edgeConnections/InvalidEdgeConnectionDTOError';
import { EdgeConnectionValidatorTestCase } from '../types/EdgeConnectionValidatorTestCase';

export default (): EdgeConnectionValidatorTestCase[] => [
    {
        validCases: [
            {
                dto: {
                    type: EdgeConnectionType.dual,
                    members: [],
                    id: '123',
                    tagIDs: ['55'],
                    note: 'These are both about bears',
                },
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
                    type: EdgeConnectionType.dual,
                    id: '123',
                    tagIDs: ['55'],
                    members: [], // TODO Add some valid members here
                    note: null,
                },
                expectedError: new InvalidEdgeConnectionDTOError([
                    new NoteMissingFromEdgeConnectionError(),
                ]),
            },
            /**
             * TODO Add invalid cases for members
             * - members[0].compositeIdentifier.type does not allow context of type
             *    members[0].context.type
             *
             * - deferred context model validation invalid cases
             *     - How far do we want to go here? We already have the lower level
             *      test. This is essentially an integration test. We only need to
             *      build confidence that this higher level validator correctly
             *      "relays the message" from the lower layer
             */
            // TODO validate types on DTO
        ],
    },
];
