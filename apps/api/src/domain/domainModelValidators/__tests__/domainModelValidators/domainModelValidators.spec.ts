import getInstanceFactoryForResource from '../../../factories/getInstanceFactoryForResource';
import { Resource } from '../../../models/resource.entity';
import { ResourceType } from '../../../types/ResourceType';
import buildDomainModelValidatorTestCases from './buildDomainModelValidatorTestCases';

const testCases = buildDomainModelValidatorTestCases();

/**
 * TODO [https://www.pivotaltracker.com/story/show/183014320]
 * Make this test for all aggregates
 */
describe('Aggregate Factories', () => {
    Object.values(ResourceType).forEach((resourceType) => {
        describe(`When building a resource of type ${resourceType}`, () => {
            it('should have a domain model validator test case', () => {
                const testCaseSearchResult = testCases.find(
                    ({ resourceType: testCaseEntityType }) => testCaseEntityType === resourceType
                );

                expect(testCaseSearchResult).toBeTruthy();
            });
        });
    });

    testCases.forEach(({ resourceType, validCases, invalidCases }) => {
        describe(`${resourceType} validator`, () => {
            describe('When the DTO is valid', () => {
                validCases.forEach(({ description, dto }, index) => {
                    describe(description || `valid case ${index + 1}`, () => {
                        it('should return Valid', () => {
                            const result = getInstanceFactoryForResource(resourceType)(dto);

                            expect(result).toBeInstanceOf(Resource);
                        });
                    });
                });
            });

            describe('When the DTO is invalid', () => {
                invalidCases.forEach(({ description, invalidDTO, expectedError }, index) => {
                    describe(description || `invalid case ${index + 1}`, () => {
                        it('should return the appropriate errors', () => {
                            const result = getInstanceFactoryForResource(resourceType)(invalidDTO);

                            expect(result).toEqual(expectedError);
                        });
                    });
                });
            });
        });
    });
});
