import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { AggregateType } from '../../../types/AggregateType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';

describe(`Vocabulary List- context validation`, () => {
    describe(`when the context is of type: textField`, () => {
        const nameChilcotin = `VL Name (Chil)`;

        const nameEnglish = `VL Name (translated to Engl)`;

        const vocabularyListName = buildMultilingualTextFromBilingualText(
            {
                text: nameChilcotin,
                languageCode: LanguageCode.Chilcotin,
            },
            {
                text: nameEnglish,
                languageCode: LanguageCode.English,
            }
        );

        const vocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
            {
                name: vocabularyListName,
            }
        );

        const validTextFieldContext = new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'name',
            languageCode: LanguageCode.Chilcotin,
            charRange: [0, nameChilcotin.length - 1],
        });

        describe(`when the context is valid`, () => {
            it(`should return Valid`, () => {
                const result = vocabularyList.validateContext(validTextFieldContext);

                expect(result).toBe(Valid);
            });
        });

        describe(`when the context is invalid`, () => {
            describe(`when the context targets a superfluous property`, () => {
                const bogusPropertyName = 'bogus-prop-name';

                const textFieldContextWithBogusTargetProperty = validTextFieldContext.clone({
                    target: bogusPropertyName,
                });

                it(`should fail with the expected error`, () => {
                    const result = vocabularyList.validateContext(
                        textFieldContextWithBogusTargetProperty
                    );

                    assertErrorAsExpected(
                        result,
                        new EmptyTargetForTextFieldContextError(vocabularyList, bogusPropertyName)
                    );
                });
            });

            describe(`when the char range is too big`, () => {
                const invalidEndIndex = 40;

                const invalidCharRange: [number, number] = [0, invalidEndIndex];

                const outOfBoundsTextFieldContext = validTextFieldContext.clone({
                    charRange: invalidCharRange,
                });

                it(`should fail with the expected error`, () => {
                    const result = vocabularyList.validateContext(outOfBoundsTextFieldContext);

                    assertErrorAsExpected(
                        result,
                        new InconsistentCharRangeError(
                            invalidCharRange,
                            vocabularyList,
                            'name',
                            nameChilcotin
                        )
                    );
                });
            });

            describe(`when the context targets a language without a value`, () => {
                const textFieldContextThatTargetsMissingLanguage = validTextFieldContext.clone({
                    languageCode: LanguageCode.French,
                });

                it(`should fail with the expected error`, () => {
                    const result = vocabularyList.validateContext(
                        textFieldContextThatTargetsMissingLanguage
                    );

                    assertErrorAsExpected(
                        result,
                        new EmptyTargetForTextFieldContextError(vocabularyList, 'name')
                    );
                });
            });
        });
    });
});
