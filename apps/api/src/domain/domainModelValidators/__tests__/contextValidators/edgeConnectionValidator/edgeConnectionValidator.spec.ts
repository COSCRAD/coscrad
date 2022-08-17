/**
 * This is a test of the `edgeConnectionValidator`, which validates a `DTO`
 * for an entire `EdgeConnection`. The implementation itself defers validation
 * of some of the nested data (the `EdgeConnectionContext` for all members in the
 * edge connection) to the `edgeConnectionContextValidators`. This test is thus
 * more of a high level test compared to `edgeConnectionContextValidators.spec.ts`.
 */

import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { EdgeConnection } from '../../../../models/context/edge-connection.entity';
import { Valid } from '../../../Valid';
import buildEdgeConnectionValidatorTestCases from './buildEdgeConnectionValidatorTestCases';

buildEdgeConnectionValidatorTestCases().forEach(({ validCases, invalidCases }) => {
    validCases.forEach(({ description, dto }, index) => {
        describe('When the DTO for an Edge Connection is valid', () => {
            describe(description || `Valid test case #${index}`, () => {
                it('should return Valid', () => {
                    const instance = new EdgeConnection(dto);

                    const result = instance.validateInvariants();

                    expect(result).toBe(Valid);
                });
            });
        });
    });

    invalidCases.forEach(({ description, invalidDTO, expectedError }) => {
        describe('When the DTO for the Edge Connection is invalid', () => {
            describe(description, () => {
                it('should return the expected Error', () => {
                    const instance = new EdgeConnection(invalidDTO);

                    const result = instance.validateInvariants();

                    assertErrorAsExpected(result, expectedError);
                });
            });
        });
    });
});
