import { InternalError } from '../../../../../lib/errors/InternalError';
import { VocabularyList } from '../../../../models/vocabulary-list/entities/vocabulary-list.entity';
import { ResourceType } from '../../../../types/ResourceType';
import InvalidVocabularyListDTOError from '../../../errors/vocabularyList/InvalidVocabularyListDTOError';
import VocabularyListHasNoEntriesError from '../../../errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from '../../../errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import vocabularyListValidator from '../../../vocabularyListValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';

const validVocabularyListDTO = getValidAggregateInstanceForTest(
    ResourceType.vocabularyList
).toDTO();

export const buildVocabularyListTestCase = (): DomainModelValidatorTestCase<VocabularyList> => ({
    resourceType: ResourceType.vocabularyList,
    validator: vocabularyListValidator,
    validCases: [
        {
            dto: {
                type: ResourceType.vocabularyList,
                variables: [],
                name: 'vlist name in language',
                nameEnglish: 'vlist name in English',
                id: '123',
                published: false,
                entries: [
                    {
                        termId: 'term123',
                        variableValues: {
                            person: '13',
                        },
                    },
                ],
            },
        },
    ],
    invalidCases: [
        {
            description: 'vocabulary list has no name in either language',
            invalidDTO: {
                id: '1234',
                entries: [
                    {
                        termId: 'term123',
                        variableValues: {
                            person: '13',
                        },
                    },
                ],
            },
            expectedError: new InvalidVocabularyListDTOError('1234', [
                new VocabularyListHasNoNameInAnyLanguageError('1234'),
            ]) as InternalError,
        },
        {
            description: 'vocabulary list has no entries',
            invalidDTO: {
                ...validVocabularyListDTO,
                entries: [],
            },
            expectedError: new InvalidVocabularyListDTOError(validVocabularyListDTO.id, [
                new VocabularyListHasNoEntriesError(validVocabularyListDTO.id),
            ]) as InternalError,
        },
    ],
});
