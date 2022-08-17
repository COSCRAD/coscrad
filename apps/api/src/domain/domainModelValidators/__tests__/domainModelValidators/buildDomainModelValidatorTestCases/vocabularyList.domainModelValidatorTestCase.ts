import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResourceType } from '../../../../types/ResourceType';
import VocabularyListHasNoEntriesError from '../../../errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from '../../../errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';

const resourceType = ResourceType.vocabularyList;

const validVocabularyListDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(resourceType);

export const buildVocabularyListTestCase =
    (): DomainModelValidatorTestCase<ResourceType.vocabularyList> => ({
        resourceType: resourceType,
        validCases: [
            {
                dto: {
                    type: resourceType,
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
                expectedError: buildTopLevelError('1234', [
                    new VocabularyListHasNoNameInAnyLanguageError('1234'),
                ]) as InternalError,
            },
            {
                description: 'vocabulary list has no entries',
                invalidDTO: {
                    ...validVocabularyListDTO,
                    entries: [],
                },
                expectedError: buildTopLevelError(validVocabularyListDTO.id, [
                    new VocabularyListHasNoEntriesError(validVocabularyListDTO.id),
                ]) as InternalError,
            },
        ],
    });
