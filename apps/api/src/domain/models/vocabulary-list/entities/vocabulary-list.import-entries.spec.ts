import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { FailedToImportEntriesToVocabularyListError } from '../errors';
import { CannotImportToVocabularyListWithExistingEntriesError } from '../errors/cannot-import-to-vocabulary-list-with-existing-entries.error';
import { EmptyVocabularyListImportRequestError } from '../errors/empty-vocabulary-list-import-request.error';
import { InvalidVocabularyListEntryInImportError } from '../errors/invalid-entry-in-import.error';
import { InvalidVocabularyListFilterPropertyValueError } from '../errors/invalid-vocabulary-list-filter-property-value.error';
import { VocabularyListFilterPropertyNotFoundError } from '../errors/vocabulary-list-filter-property-not-found.error';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyList, VocabularyListEntryImportItem } from './vocabulary-list.entity';

const vocabularyListWithNoPropertyFilters = getValidAggregateInstanceForTest(
    AggregateType.vocabularyList
).clone({
    // cannot publish voabulary list with no entries
    published: false,
    entries: [],
    variables: [],
});

const vocabularyList = vocabularyListWithNoPropertyFilters.safeClone({
    variables: [
        {
            name: 'person',
            type: DropboxOrCheckbox.dropbox,
            validValues: [
                {
                    value: '11',
                    display: 'I',
                },
                {
                    value: '31',
                    display: 'he or she',
                },
            ],
        },
        {
            name: 'positive',
            type: DropboxOrCheckbox.checkbox,
            validValues: [
                {
                    value: true,
                    display: 'positive',
                },
                {
                    value: false,
                    display: 'negative',
                },
            ],
        },
    ],
}) as VocabularyList;

const entriesToImport: VocabularyListEntryImportItem[] = [
    {
        termId: buildDummyUuid(1),
        propertyValues: {
            person: '11',
            positive: true,
        },
    },
    {
        termId: buildDummyUuid(2),
        propertyValues: {
            person: '11',
            positive: false,
        },
    },
    {
        termId: buildDummyUuid(3),
        propertyValues: {
            person: '31',
            positive: true,
        },
    },
    {
        termId: buildDummyUuid(4),
        propertyValues: {
            person: '31',
            positive: false,
        },
    },
];

describe(`VocabularyList.importEntries`, () => {
    describe(`when the import is valid`, () => {
        it(`should succeed`, () => {
            const result = vocabularyList.importEntries(entriesToImport);

            expect(result).toBeInstanceOf(VocabularyList);

            const updatedVocabularyList = result as VocabularyList;

            const numberOfEntries = updatedVocabularyList.entries.length;

            expect(numberOfEntries).toBe(entriesToImport.length);

            const termsNotInList = entriesToImport.filter(({ termId }) =>
                updatedVocabularyList.entries.every(
                    ({ termId: termIdInList }) => termIdInList !== termId
                )
            );

            expect(termsNotInList).toEqual([]);
        });
    });

    describe(`when the import is invalid`, () => {
        describe(`when one of the properties has not been registered for the vocabulary list`, () => {
            it(`should fail with the expected error`, () => {
                const result = vocabularyListWithNoPropertyFilters.importEntries(entriesToImport);

                const expectedInnerErrors = Object.keys(entriesToImport[0].propertyValues).map(
                    (propertyName) =>
                        new InvalidVocabularyListEntryInImportError(entriesToImport[0].termId, [
                            new VocabularyListFilterPropertyNotFoundError(
                                propertyName,
                                vocabularyListWithNoPropertyFilters.id
                            ),
                        ])
                );

                assertErrorAsExpected(
                    result,
                    new FailedToImportEntriesToVocabularyListError(
                        vocabularyListWithNoPropertyFilters.id,
                        expectedInnerErrors
                    )
                );
            });
        });

        describe(`when one of the property values is not in the allowed list`, () => {
            it(`should fail`, () => {
                const invalidValue = 'not-known';

                const result = vocabularyList.importEntries(
                    entriesToImport.concat({
                        termId: buildDummyUuid(55),
                        propertyValues: {
                            person: invalidValue,
                            positive: true,
                        },
                    })
                );

                const expectedInnerError = new InvalidVocabularyListEntryInImportError(
                    buildDummyUuid(55),
                    [
                        new InvalidVocabularyListFilterPropertyValueError(
                            'person',
                            invalidValue,
                            vocabularyList.id
                        ),
                    ]
                );

                assertErrorAsExpected(
                    result,
                    new FailedToImportEntriesToVocabularyListError(
                        vocabularyListWithNoPropertyFilters.id,
                        [expectedInnerError]
                    )
                );

                assertErrorAsExpected(
                    result,
                    new FailedToImportEntriesToVocabularyListError(vocabularyList.id, [])
                );
            });
        });

        describe(`when no entries are provided`, () => {
            it(`should fail with the expected error`, () => {
                const result = vocabularyList.importEntries([]);

                assertErrorAsExpected(
                    result,
                    new FailedToImportEntriesToVocabularyListError(vocabularyList.id, [
                        new EmptyVocabularyListImportRequestError(),
                    ])
                );
            });
        });

        describe(`when the vocabulary list already has entries`, () => {
            it(`should fail with the expected error`, () => {
                const result = vocabularyList
                    .clone({
                        entries: [
                            {
                                termId: buildDummyUuid(99),
                                variableValues: {
                                    person: '11',
                                    positive: true,
                                },
                            },
                        ],
                    })
                    .importEntries(entriesToImport);

                assertErrorAsExpected(
                    result,
                    new FailedToImportEntriesToVocabularyListError(vocabularyList.id, [
                        new CannotImportToVocabularyListWithExistingEntriesError(),
                    ])
                );
            });
        });

        describe(`when one of the term ids is an empty string`, () => {
            it(`should fail with the expected error`, () => {
                const result = vocabularyList.importEntries([
                    {
                        termId: '',
                        propertyValues: entriesToImport[0].propertyValues,
                    },
                ]);

                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(vocabularyList.getCompositeIdentifier(), [])
                );
            });
        });
    });
});
