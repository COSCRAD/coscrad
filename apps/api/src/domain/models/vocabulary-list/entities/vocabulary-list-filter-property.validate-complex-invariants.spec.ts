import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { DTO } from '../../../../types/DTO';
import {
    DuplicateLabelForVocabularyListFilterPropertyValueError,
    DuplicateValueForVocabularyListFilterPropertyValueError,
} from '../errors';
import { CheckboxMustHaveExactlyTwoAllowedValuesError } from '../errors/checkbox-must-have-exactly-two-allowed-values.error';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { InvalidValueForCheckboxFilterPropertyError } from './invalid-value-for-checkbox-filter-property.error';
import { InvalidValueForSelectFilterPropertyError } from './invalid-value-for-select-filter-property.error';
import { VocabularyListFilterProperty } from './vocabulary-list-variable.entity';

const validValuesForSelect = [
    {
        value: '1',
        display: 'prorgressive',
    },
    {
        value: '2',
        display: 'perfective',
    },
    {
        value: '3',
        display: 'inceptive progressive',
    },
];

const validValuesForCheckbox = [
    {
        value: true,
        display: 'positive (switch for negative)',
    },
    {
        value: false,
        display: 'negative (switch for positive)',
    },
];

describe('VocabularyListVariable.validateComplexInvariants', () => {
    const validDto: DTO<VocabularyListFilterProperty> = {
        name: 'aspect',
        type: DropboxOrCheckbox.dropbox,
        validValues: validValuesForSelect,
    };

    describe(`when the input is valid`, () => {
        it(`should return no errors`, () => {
            const validationResult = new VocabularyListFilterProperty(
                validDto
            ).validateComplexInvariants();

            expect(validationResult).toEqual([]);
        });
    });

    describe(`when the input is invalid`, () => {
        describe(`when there is a non-string value for a dropdown filter property`, () => {
            it(`should return the appropriate error`, () => {
                const invalidDto: DTO<VocabularyListFilterProperty<boolean | string>> = {
                    ...validDto,
                    validValues: [
                        ...validValuesForSelect,
                        {
                            // this isn't allowed to be a number
                            value: false,
                            label: 'foo',
                        },
                    ],
                };

                const result = new VocabularyListFilterProperty(
                    invalidDto
                ).validateComplexInvariants();

                expect(result.length).toBeGreaterThan(0);

                assertErrorAsExpected(
                    result[0],
                    new InvalidValueForSelectFilterPropertyError(
                        { value: false, label: 'foo' },
                        validDto.name
                    )
                );
            });
        });

        describe(`when one there is a string value for a checkbox filter property`, () => {
            const invalidValueAndDisplay = {
                // this isn't allowed to be a number
                value: 'bogus- I should be boolean',
                display: 'foo',
            };

            it(`should return the appropriate error`, () => {
                const invalidDto: DTO<VocabularyListFilterProperty<boolean | string>> = {
                    ...validDto,
                    type: DropboxOrCheckbox.checkbox,
                    validValues: [validValuesForCheckbox[0], invalidValueAndDisplay],
                };

                const result = new VocabularyListFilterProperty(
                    invalidDto
                ).validateComplexInvariants();

                expect(result.length).toBeGreaterThan(0);

                assertErrorAsExpected(
                    result[0],
                    new InvalidValueForCheckboxFilterPropertyError(
                        invalidValueAndDisplay,
                        validDto.name
                    )
                );
            });
        });

        describe(`when there is less than 2 valid values for a checkbox filter property`, () => {
            it(`should fail with the expected errors`, () => {
                const invalidDto: DTO<VocabularyListFilterProperty> = {
                    ...validDto,
                    type: DropboxOrCheckbox.checkbox,
                    validValues: [validValuesForCheckbox[0]],
                };

                const result = new VocabularyListFilterProperty(
                    invalidDto
                ).validateComplexInvariants();

                expect(result.length).toBe(1);

                assertErrorAsExpected(
                    result[0],
                    new CheckboxMustHaveExactlyTwoAllowedValuesError(validDto.name, [
                        validValuesForCheckbox[0],
                    ])
                );
            });
        });

        describe(`when there is more than 2 valid values for a checkbox filter property`, () => {
            it(`should fail with the expected errors`, () => {
                const invalidDto: DTO<VocabularyListFilterProperty> = {
                    ...validDto,
                    type: DropboxOrCheckbox.checkbox,
                    validValues: [
                        ...validValuesForCheckbox,
                        {
                            value: 'bogus',
                            label: 'label for bogus',
                        },
                    ],
                };

                const result = new VocabularyListFilterProperty(
                    invalidDto
                ).validateComplexInvariants();

                /**
                 * Note that this breaks multiple rules since
                 * the only possible values for a `Checkbox`
                 * are `true` or `false`.
                 */
                expect(result.length).toBeGreaterThan(0);
            });
        });

        describe(`when 2 allowed values have the same value`, () => {
            const invalidDto: DTO<VocabularyListFilterProperty> = {
                ...validDto,
                type: DropboxOrCheckbox.checkbox,
                validValues: [
                    {
                        value: true,
                        label: 'positive',
                    },
                    {
                        value: true,
                        label: 'negative',
                    },
                ],
            };

            const result = new VocabularyListFilterProperty(invalidDto).validateComplexInvariants();

            assertErrorAsExpected(
                result[0],
                new DuplicateValueForVocabularyListFilterPropertyValueError(
                    validDto.name,
                    'positive',
                    true
                )
            );

            assertErrorAsExpected(
                result[1],
                new DuplicateValueForVocabularyListFilterPropertyValueError(
                    validDto.name,
                    'negative',
                    true
                )
            );
        });

        describe(`when 2 allowed values have the same label`, () => {
            const duplicateLabel = 'I';

            const invalidDto: DTO<VocabularyListFilterProperty> = {
                ...validDto,
                type: DropboxOrCheckbox.dropbox,
                validValues: [
                    {
                        value: '1',
                        label: duplicateLabel,
                    },
                    {
                        value: '11',
                        label: duplicateLabel,
                    },
                ],
            };

            const result = new VocabularyListFilterProperty(invalidDto).validateComplexInvariants();

            assertErrorAsExpected(
                result[0],
                new DuplicateLabelForVocabularyListFilterPropertyValueError(
                    validDto.name,
                    duplicateLabel,
                    '1'
                )
            );

            assertErrorAsExpected(
                result[1],
                new DuplicateLabelForVocabularyListFilterPropertyValueError(
                    validDto.name,
                    duplicateLabel,
                    '11'
                )
            );
        });
    });
});
