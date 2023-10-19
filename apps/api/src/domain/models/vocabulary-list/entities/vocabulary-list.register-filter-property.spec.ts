import { isDeepStrictEqual } from 'util';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import { CannotHaveTwoFilterPropertiesWithTheSameNameError } from '../errors';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyList } from './vocabulary-list.entity';

const filterPropertyName = 'person';

const newFilterPropertyType = DropboxOrCheckbox.dropbox;

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

            // todo move this logic to a query method on the model \ nested entity
            const newFilterPropertySearchResult = updatedVocabularyList.variables?.find(
                ({ name }) => name === filterPropertyName
            );

            const { type, validValues } = newFilterPropertySearchResult;

            const missingAllowedValues = validValues.filter(
                (validValue) =>
                    !allowedValuesWithLabels.some((newValidValue) =>
                        isDeepStrictEqual(newValidValue, validValue)
                    )
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
                expect(type).toBe(newFilterPropertyType);
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

        describe(`when there is an invalid vocabulary list variable definition`, () => {
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
                    DropboxOrCheckbox.checkbox,
                    // @ts-expect-error TODO fix the types here
                    invalidValuesForCheckbox
                );

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
