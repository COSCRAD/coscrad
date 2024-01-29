import { isDeepStrictEqual } from 'util';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import { FilterPropertyType } from '../commands';
import { CannotHaveTwoFilterPropertiesWithTheSameNameError } from '../errors';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyListFilterProperty } from './vocabulary-list-variable.entity';
import { VocabularyList } from './vocabulary-list.entity';

const filterPropertyName = 'person';

const newFilterPropertyType = FilterPropertyType.selection; // corresponds to DropboxOrCheckbox.dropbox;

const allowedValuesWithLabels = [
    {
        value: '1',
        label: 'I',
    },
    {
        value: '2',
        label: 'You',
    },
    {
        value: '3',
        label: 'She, he, or it',
    },
];

describe(`VocabularyList.registerFilterProperty`, () => {
    const basicVocabularyList = getValidAggregateInstanceForTest(
        AggregateType.vocabularyList
    ).clone({
        entries: [],
        variables: [],
        published: false,
    });

    describe(`when the input is valid`, () => {
        describe(`when registering filter properties before adding any entries`, () => {
            const vocabularyListUpdateResult = basicVocabularyList.registerFilterProperty(
                filterPropertyName,
                newFilterPropertyType,
                allowedValuesWithLabels
            );

            const updatedVocabularyList = vocabularyListUpdateResult as VocabularyList;

            const newFilterPropertySearchResult =
                updatedVocabularyList.getFilterPropertyByName(filterPropertyName);

            const { type, validValues } =
                newFilterPropertySearchResult as VocabularyListFilterProperty;

            const missingAllowedValues = validValues.filter(
                (validValue) =>
                    !allowedValuesWithLabels
                        .map(
                            // TODO remove this gotcha! and use a consistent API across the board
                            ({ label, value }) => ({ value, display: label })
                        )
                        .some((newValidValue) => isDeepStrictEqual(newValidValue, validValue))
            );

            it(`should return a new reference to a vocabulary list`, () => {
                expect(vocabularyListUpdateResult).toBeInstanceOf(VocabularyList); // and not an error

                // ensure (at least at the top level) a new object (clone) has been returned
                expect(vocabularyListUpdateResult).not.toBe(basicVocabularyList);
            });

            it(`should add a filter property with the given name`, () => {
                // i.e., expect we get an object and not undefined
                expect(newFilterPropertySearchResult).toBeTruthy();
            });

            it(`should apply the correct type to the new filter`, () => {
                /**
                 * Note that as it stands, the database has "dropbox", but the
                 * models and command \ event payloads use "selection" from
                 * `FilterPropertyType`.
                 */
                expect(type).toBe(DropboxOrCheckbox.dropbox);
            });

            it(`should set all of the valid values for the new filter property`, () => {
                expect(missingAllowedValues).toEqual([]);
            });
        });
    });

    describe(`when the input is invalid`, () => {
        describe(`when there is already a filter property with the given name`, () => {
            // we are asserting this update method will not error out (have tested it in the happy path)
            const vocabularyListWithExistingFilterProperty =
                basicVocabularyList.registerFilterProperty(
                    filterPropertyName,
                    newFilterPropertyType,
                    allowedValuesWithLabels
                ) as VocabularyList;

            const vocabularyListUpdateResult =
                vocabularyListWithExistingFilterProperty.registerFilterProperty(
                    filterPropertyName,
                    newFilterPropertyType,
                    allowedValuesWithLabels
                );

            it(`should return the expected error`, () => {
                assertErrorAsExpected(
                    vocabularyListUpdateResult,
                    new CannotHaveTwoFilterPropertiesWithTheSameNameError(
                        filterPropertyName,
                        basicVocabularyList.id
                    )
                );
            });
        });

        describe(`when there is an invalid vocabulary list variable definition (string value for checkbox)`, () => {
            const invalidValuesForCheckbox = [
                {
                    // can only be boolean: true \ false
                    value: 'invalid',
                    display: 'positive (switch for negative)',
                },
                {
                    value: false,
                    display: 'negative (switch for positive)',
                },
            ];

            it(`should flow through the nested errors`, () => {
                const result = basicVocabularyList.registerFilterProperty(
                    'aspect',
                    FilterPropertyType.checkbox, // corresponds to DropboxOrCheckbox.checkbox,
                    invalidValuesForCheckbox.map(({ value, display }) => ({
                        value,
                        // TODO make the API consistent across the board
                        label: display,
                    }))
                );

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
