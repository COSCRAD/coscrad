import { InternalError } from '../../../../lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../models/context/types/EdgeConnectionContextType';
import { Valid } from '../../Valid';
import buildEdgeConnectionContextValidatorTestCases from './buildEdgeConnectionContextValidatorTestCases';

const testCases = buildEdgeConnectionContextValidatorTestCases();

// There is nothing to validate for these contezt types
const trivialContextTypes = [EdgeConnectionContextType.general, EdgeConnectionContextType.identity];

describe('Edge Connection Validators', () => {
    Object.values(EdgeConnectionContextType)
        // there is no need to validate the general context
        .filter((contextType) => !trivialContextTypes.includes(contextType))
        .forEach((contextType) => {
            describe(`A context of type ${contextType}`, () => {
                it('should have a corresponding edge connection validator test case', () => {
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
