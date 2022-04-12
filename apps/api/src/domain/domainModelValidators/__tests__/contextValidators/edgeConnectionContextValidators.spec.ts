import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../models/context/types/EdgeConnectionContextType';
import { Valid } from '../../Valid';
import buildEdgeConnectionContextValidatorTestCases from './buildEdgeConnectionContextValidatorTestCases';

const testCases = buildEdgeConnectionContextValidatorTestCases();

describe('Edge Connection Validators', () => {
    Object.values(EdgeConnectionContextType)
        // there is no need to validate the general context
        .filter((contextType) => contextType !== EdgeConnectionContextType.general)
        .forEach((contextType) => {
            describe(`An entity of type ${contextType}`, () => {
                it('should have an edge connection validator test case', () => {
                    const testCaseSearchResult = testCases.find(
                        ({ contextType: testCaseContextType }) =>
                            testCaseContextType === contextType
                    );

                    expect(testCaseSearchResult).toBeTruthy();
                });
            });
        });

    testCases.forEach(({ contextType, validCases, invalidCases, validator }) => {
        describe(`${contextType} validator`, () => {
            describe('When the DTO is valid', () => {
                validCases.forEach(({ description, dto }, index) => {
                    describe(description || `valid case ${index + 1}`, () => {
                        it('should return Valid', () => {
                            const result = validator(dto);

                            expect(result).toBe(Valid);
                        });
                    });
                });
            });
        });

        describe('When the DTO is invalid', () => {
            invalidCases.forEach(({ description, invalidDTO, expectedError }, index) => {
                describe(description || `invalid case ${index + 1}`, () => {
                    it('should return the appropriate errors', () => {
                        const result = validator(invalidDTO);

                        expect(result).toEqual(expectedError);

                        const { innerErrors } = result as InternalError;

                        expect(innerErrors).toEqual(expectedError.innerErrors);
                    });
                });
            });
        });
    });
});
