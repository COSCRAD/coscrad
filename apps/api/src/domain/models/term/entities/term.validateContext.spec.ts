import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../domainModelValidators/Valid';
import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { AggregateType } from '../../../types/AggregateType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';

describe(`Term context validation`, () => {
    describe(`when the context type is textField`, () => {
        const termTextInEnglish = `Term Name`;

        const languageCode = LanguageCode.English;

        const text = buildMultilingualTextWithSingleItem(termTextInEnglish, languageCode);

        const term = getValidAggregateInstanceForTest(AggregateType.term).clone({
            text: text,
        });

        const validTextFieldContext = new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'text',
            languageCode,
            charRange: [1, termTextInEnglish.length - 1],
        });

        describe(`when the context is valid`, () => {
            it(`should return Valid`, () => {
                const result = term.validateContext(validTextFieldContext);

                expect(result).toBe(Valid);
            });
        });

        describe(`when the context is invalid`, () => {
            describe(`when the context targets a non-existant property`, () => {
                const textFieldThatTargetsSuperfluousProperty = validTextFieldContext.clone({
                    target: 'bogus',
                });

                it(`should fail with the expected error`, () => {
                    const result = term.validateContext(textFieldThatTargetsSuperfluousProperty);

                    assertErrorAsExpected(
                        result,
                        new EmptyTargetForTextFieldContextError(term, 'bogus')
                    );
                });
            });

            describe(`when the char range is too big`, () => {
                const invalidEndIndex = 100;

                const invalidCharRange: [number, number] = [2, invalidEndIndex];

                const outOfBoundsTextFieldContext = validTextFieldContext.clone({
                    charRange: invalidCharRange,
                });

                it(`should return the expected error`, () => {
                    const result = term.validateContext(outOfBoundsTextFieldContext);

                    assertErrorAsExpected(
                        result,
                        new InconsistentCharRangeError(
                            invalidCharRange,
                            term,
                            'text',
                            termTextInEnglish
                        )
                    );
                });
            });

            describe(`when the context targets a language without a value for the given target property`, () => {
                const textFieldContextTargettingMissingLanguage = validTextFieldContext.clone({
                    languageCode: LanguageCode.Chinook,
                });

                it(`should fail with the expected error`, () => {
                    const result = term.validateContext(textFieldContextTargettingMissingLanguage);

                    assertErrorAsExpected(
                        result,
                        new EmptyTargetForTextFieldContextError(term, 'text')
                    );
                });
            });
        });
    });
});
