import { resourceTypes } from '../../../types/resourceTypes';
import { Valid } from '../../Valid';
import buildDomainModelValidatorTestCases from './buildDomainModelValidatorTestCases';

const testCases = buildDomainModelValidatorTestCases();

describe('Domain Model Validators', () => {
    Object.values(resourceTypes).forEach((resourceType) => {
        describe(`An entity of type ${resourceType}`, () => {
            it('should have a domain model validator test case', () => {
                const testCaseSearchResult = testCases.find(
                    ({ resourceType: testCaseEntityType }) => testCaseEntityType === resourceType
                );

                expect(testCaseSearchResult).toBeTruthy();
            });
        });
    });

    testCases.forEach(({ resourceType, validCases, invalidCases, validator }) => {
        describe(`${resourceType} validator`, () => {
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

            describe('When the DTO is invalid', () => {
                invalidCases.forEach(({ description, invalidDTO, expectedError }, index) => {
                    describe(description || `invalid case ${index + 1}`, () => {
                        it('should return the appropriate errors', () => {
                            const result = validator(invalidDTO);

                            expect(result).toEqual(expectedError);
                        });
                    });
                });
            });
        });
    });
});
