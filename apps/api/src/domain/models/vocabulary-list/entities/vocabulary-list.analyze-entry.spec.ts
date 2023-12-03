import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import {
    CannotOverwriteFilterPropertyValueForVocabularyListEntryError,
    FailedToAnalyzeVocabularyListEntryError,
} from '../errors';
import { InvalidVocabularyListFilterPropertyValueError } from '../errors/invalid-vocabulary-list-filter-property-value.error';
import { VocabularyListEntryNotFoundError } from '../errors/vocabulary-list-entry-not-found.error';
import { VocabularyListFilterPropertyNotFoundError } from '../errors/vocabulary-list-filter-property-not-found.error';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListFilterProperty } from './vocabulary-list-variable.entity';
import { VocabularyList } from './vocabulary-list.entity';

const validValueForCheckBox = true;

const existingCheckBoxFilterProperty: VocabularyListFilterProperty<boolean> =
    new VocabularyListFilterProperty({
        name: 'positive',
        type: DropboxOrCheckbox.checkbox,
        validValues: [
            { value: validValueForCheckBox, display: 'positive' },
            {
                value: !validValueForCheckBox,
                display: 'negative',
            },
        ],
    });

const validValueForSelect = '2a';

const additionalValidValueForSelect = '2d';

const existingSelectProperty = new VocabularyListFilterProperty<string>({
    name: 'unit',
    type: DropboxOrCheckbox.dropbox,
    validValues: [
        {
            value: validValueForSelect,
            display: 'Two A',
        },
        {
            value: '2b',
            display: 'Two B',
        },
        {
            value: additionalValidValueForSelect,
            display: 'Two C',
        },
    ],
});

const existingEntry = new VocabularyListEntry({
    termId: buildDummyUuid(55),
    variableValues: {},
});

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        variables: [existingCheckBoxFilterProperty, existingSelectProperty],
        entries: [existingEntry],
    }
);

/**
 * TODO Make all cases comprehensive for all filter property types (currently
 * checkbox and dropbox)
 */
describe('VocabularyList.analyzeEntry', () => {
    describe('when the analysis is valid', () => {
        it('should return a new vocabulary list with the analysis applied', () => {
            const result = existingVocabularyList.analyzeEntry(
                existingEntry.termId,
                existingCheckBoxFilterProperty.name,
                validValueForCheckBox
            );

            expect(result).toBeInstanceOf(VocabularyList);
        });
    });

    describe(`when the analysis is inconsistent with existing state`, () => {
        describe(`when there is no entry for the term`, () => {
            const missingTermId = 'not-found-entry-123';

            it(`should return the expected error`, () => {
                const result = existingVocabularyList.analyzeEntry(
                    missingTermId,
                    existingCheckBoxFilterProperty.name,
                    validValueForCheckBox
                );

                assertErrorAsExpected(
                    result,
                    new VocabularyListEntryNotFoundError(missingTermId, existingVocabularyList.id)
                );
            });
        });

        describe(`when the filter property has not been registered`, () => {
            it(`should return the expected error`, () => {
                const missingFilterPropertyName = 'boooooogus';

                const result = existingVocabularyList.analyzeEntry(
                    existingEntry.termId,
                    missingFilterPropertyName,
                    validValueForCheckBox
                );

                assertErrorAsExpected(
                    result,
                    new VocabularyListFilterPropertyNotFoundError(
                        missingFilterPropertyName,
                        existingVocabularyList.id
                    )
                );
            });
        });

        describe(`when the value is not one of the allowed values for the vocabulary list`, () => {
            it(`should return the expected error`, () => {
                const unregisteredValue = '3c';

                const result = existingVocabularyList.analyzeEntry(
                    existingEntry.termId,
                    existingSelectProperty.name,
                    unregisteredValue
                );

                assertErrorAsExpected(
                    result,
                    new InvalidVocabularyListFilterPropertyValueError(
                        existingSelectProperty.name,
                        unregisteredValue,
                        existingVocabularyList.id
                    )
                );
            });
        });

        describe(`when a value has already been registered for the given filter property for this entry`, () => {
            it(`should fail with the expected errors`, () => {
                const vocabularyListWithValueRegisteredForEntry =
                    existingVocabularyList.analyzeEntry(
                        existingEntry.termId,
                        existingSelectProperty.name,
                        validValueForSelect
                    ) as VocabularyList;

                const result = vocabularyListWithValueRegisteredForEntry.analyzeEntry(
                    existingEntry.termId,
                    existingSelectProperty.name,
                    additionalValidValueForSelect
                );

                assertErrorAsExpected(
                    result,
                    new FailedToAnalyzeVocabularyListEntryError(
                        existingEntry.termId,
                        existingVocabularyList.id,
                        [
                            new CannotOverwriteFilterPropertyValueForVocabularyListEntryError(
                                existingSelectProperty.name,
                                additionalValidValueForSelect,
                                validValueForSelect
                            ),
                        ]
                    )
                );
            });
        });

        // TODO Validate that empty strings trigger invariant validation errors
    });
});
