import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { DTO } from '../../../../types/DTO';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { InvalidValueForCheckboxFilterPropertyError } from './invalid-value-for-checkbox-filter-property.error';
import { InvalidValueForSelectFilterPropertyError } from './invalid-value-for-select-filter-property.error';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

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
    const validDto: DTO<VocabularyListVariable> = {
        name: 'aspect',
        type: DropboxOrCheckbox.dropbox,
        validValues: validValuesForSelect,
    };

    describe(`when the input is valid`, () => {
        it(`should return no errors`, () => {
            const validationResult = new VocabularyListVariable(
                validDto
            ).validateComplexInvariants();

            expect(validationResult).toEqual([]);
        });
    });

    describe(`when the input is invalid`, () => {
        describe(`when there is a non-string value for a dropdown filter property`, () => {
            it(`should return the appropriate error`, () => {
                const invalidDto: DTO<VocabularyListVariable<boolean | string>> = {
                    ...validDto,
                    validValues: [
                        ...validValuesForSelect,
                        {
                            // this isn't allowed to be a number
                            value: false,
                            display: 'foo',
                        },
                    ],
                };

                const result = new VocabularyListVariable(invalidDto).validateComplexInvariants();

                expect(result.length).toBeGreaterThan(0);

                assertErrorAsExpected(
                    result[0],
                    new InvalidValueForSelectFilterPropertyError(
                        { value: false, display: 'foo' },
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
                const invalidDto: DTO<VocabularyListVariable<boolean | string>> = {
                    ...validDto,
                    type: DropboxOrCheckbox.checkbox,
                    validValues: [validValuesForCheckbox[0], invalidValueAndDisplay],
                };

                const result = new VocabularyListVariable(invalidDto).validateComplexInvariants();

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
            it.todo(`should fail with the expected errors`);
        });

        describe(`when there is more than 2 valid values for a checkbox filter property`, () => {
            it.todo(`should have a test`);
        });
    });
});
