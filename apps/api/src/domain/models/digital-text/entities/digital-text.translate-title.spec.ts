import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../common/entities/errors';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../../types/AggregateType';
import { DigitalText } from './digital-text.entity';

const existingLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const originalTitleText = 'original title';

const existingTitle = buildMultilingualTextWithSingleItem(originalTitleText, existingLanguageCode);

const digitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    title: existingTitle,
});

const translationOfTitle = `translation of title`;

describe(`DigitalText.translateTitle`, () => {
    describe(`when the translation is valid`, () => {
        it(`should return the updated title`, () => {
            const result = digitalText.translateTitle(translationOfTitle, translationLanguageCode);

            expect(result).toBeInstanceOf(DigitalText);

            const updatedDigitalText = result as DigitalText;

            const translationTextSearchResult =
                updatedDigitalText.title.getTranslation(translationLanguageCode);

            expect(translationTextSearchResult).not.toBe(NotFound);

            const newTextItem = translationTextSearchResult as MultilingualTextItem;

            const { text, role } = newTextItem;

            expect(text).toBe(translationOfTitle);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`when the translation is invalid`, () => {
        describe(`when the translation and original languages are the same`, () => {
            it(`should return the expected error`, () => {
                const result = digitalText.translateTitle(translationOfTitle, existingLanguageCode);

                assertErrorAsExpected(
                    result,
                    new CannotAddDuplicateTranslationError(
                        new MultilingualTextItem({
                            text: translationOfTitle,
                            languageCode: existingLanguageCode,
                            role: MultilingualTextItemRole.freeTranslation,
                        }),
                        digitalText.title
                    )
                );
            });
        });

        describe(`when the title has already been translated to the target language`, () => {
            it(`should return the expected error`, () => {
                const digitalTextWithTranslation = digitalText.translateTitle(
                    translationOfTitle,
                    translationLanguageCode
                ) as DigitalText;

                const result = digitalTextWithTranslation.translateTitle(
                    translationOfTitle,
                    translationLanguageCode
                );

                assertErrorAsExpected(
                    result,
                    new CannotAddDuplicateTranslationError(
                        new MultilingualTextItem({
                            text: translationOfTitle,
                            languageCode: translationLanguageCode,
                            role: MultilingualTextItemRole.freeTranslation,
                        }),
                        digitalTextWithTranslation.title
                    )
                );
            });
        });

        describe(`when the translation is an empty string`, () => {
            it(`should return an error`, () => {
                const result = digitalText.translateTitle('', translationLanguageCode);

                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(digitalText.getCompositeIdentifier(), [])
                );
            });
        });
    });
});
