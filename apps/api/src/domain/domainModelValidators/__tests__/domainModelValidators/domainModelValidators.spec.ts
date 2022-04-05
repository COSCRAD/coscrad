import { PartialDTO } from '../../../../types/partial-dto';
import { VocabularyList } from '../../../models/vocabulary-list/entities/vocabulary-list.entity';
import { entityTypes } from '../../../types/entityTypes';
import { Valid } from '../../Valid';
import buildDomainModelValidatorTestCases from './buildDomainModelValidatorTestCases';

const validVocabularyListDTO: PartialDTO<VocabularyList> = {
    name: 'vlist name in language',
    nameEnglish: 'vlist name in English',
    id: '123',
    entries: [
        {
            termId: 'term123',
            variableValues: {
                person: '13',
            },
        },
    ],
};

const testCases = buildDomainModelValidatorTestCases();

describe('Domain Model Vallidators', () => {
    Object.values(entityTypes).forEach((entityType) => {
        describe.skip(`An entity of type ${entityType}`, () => {
            it('should have a domain model validator test case', () => {
                const testCaseSearchResult = testCases.find(
                    ({ entityType: testCaseEntityType }) => testCaseEntityType === entityType
                );

                expect(testCaseSearchResult).toBeTruthy();
            });
        });
    });

    testCases.forEach(({ entityType, validCases, invalidCases, validator }) => {
        describe(`${entityType} validator`, () => {
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
                    });
                });
            });
        });
    });
});
