import { InternalError } from '../../lib/errors/InternalError';
import { PartialDTO } from '../../types/partial-dto';
import { Entity } from '../models/entity';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { EntityType, entityTypes } from '../types/entityTypes';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import TagHasNoTextError from './errors/tag/TagHasNoTextError';
import InvalidTermDTOError from './errors/term/InvalidTermDTOError';
import TermHasNoTextInAnyLanguageError from './errors/term/TermHasNoTextInAnyLanguageError';
import InvalidVocabularyListDTOError from './errors/vocabularyList/InvalidVocabularyListDTOError';
import VocabularyListHasNoEntriesError from './errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from './errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import { DomainModelValidator } from './index';
import tagValidator from './tagValidator';
import termValidator from './termValidator';
import { Valid } from './Valid';
import vocabularyListValidator from './vocabularyListValidator';

type DomainModelValidatorTestCase<TEntity extends Entity = Entity> = {
    entityType: EntityType; // TODO correlate this with TEntity
    validator: DomainModelValidator;
    validCases: {
        description?: string;
        dto: PartialDTO<TEntity>;
    }[];
    invalidCases: {
        description?: string;
        invalidDTO: PartialDTO<TEntity>;
        expectedError: InternalError;
    }[];
};

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

const validTagDTO: PartialDTO<Tag> = {
    id: '11',
    text: 'wardrobe',
    published: true,
};

const testCases: (
    | DomainModelValidatorTestCase<Term>
    | DomainModelValidatorTestCase<VocabularyList>
    | DomainModelValidatorTestCase<Tag>
)[] = [
    {
        entityType: entityTypes.term,
        validator: termValidator,
        validCases: [
            {
                dto: {
                    term: 'test term in language',
                    termEnglish: 'test term in english',
                    id: '123',
                    published: true,
                },
            },
        ],
        invalidCases: [
            {
                description: 'Both term and termEnglish are empty',
                invalidDTO: {
                    id: '123',
                },
                expectedError: new InvalidTermDTOError('123', [
                    new TermHasNoTextInAnyLanguageError('123'),
                ]),
            },
        ],
    },
    {
        entityType: entityTypes.vocabularyList,
        validator: vocabularyListValidator,
        validCases: [
            {
                dto: {
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
                ]),
            },
            {
                description: 'vocabulary list has no entries',
                invalidDTO: {
                    ...validVocabularyListDTO,
                    entries: [],
                },
                expectedError: new InvalidVocabularyListDTOError(validVocabularyListDTO.id, [
                    new VocabularyListHasNoEntriesError(validVocabularyListDTO.id),
                ]),
            },
        ],
    },
    {
        entityType: entityTypes.tag,
        validator: tagValidator,
        validCases: [
            {
                dto: validTagDTO,
            },
        ],
        invalidCases: [
            {
                description: 'No text is provided for the tag',
                invalidDTO: {
                    ...validTagDTO,
                    text: undefined,
                },
                expectedError: new InvalidEntityDTOError(entityTypes.tag, validTagDTO.id, [
                    new TagHasNoTextError(validTagDTO.id),
                ]),
            },
        ],
    },
];

describe('Domain Model Vallidators', () => {
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
