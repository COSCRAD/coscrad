import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { MissingPageError } from '../errors';
import { MissingPageContentError } from '../errors/missing-page-content.error';
import DigitalTextPage from './digital-text-page.entity';
import { DigitalText } from './digital-text.entity';

const targetPageIdentifier = '12';

const existingLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const existingPage = new DigitalTextPage({
    identifier: targetPageIdentifier,
    content: buildMultilingualTextWithSingleItem(`existing content`, existingLanguageCode),
});

const digitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [existingPage],
});

describe(`DigitalText.translatePageContent`, () => {
    describe(`when the translation is valid`, () => {
        const translationText = `translation of content`;

        it(`should return the updated digital text`, () => {
            const result = digitalText.translatePageContent(
                targetPageIdentifier,
                translationText,
                translationLanguageCode
            );

            expect(result).not.toBeInstanceOf(InternalError);

            const updatedDigitalText = result as DigitalText;

            const updatedPage = updatedDigitalText.getPage(targetPageIdentifier) as DigitalTextPage;

            const updatedContent = updatedPage.getContent() as MultilingualText;

            const translationTextItem = updatedContent.getTranslation(translationLanguageCode);

            expect(translationTextItem).not.toBe(NotFound);

            const { text, languageCode } = translationTextItem as MultilingualTextItem;

            expect(text).toBe(translationText);

            expect(languageCode).toBe(translationLanguageCode);
        });
    });

    describe(`when the translation is invalid`, () => {
        describe(`when the page does not exist`, () => {
            const missingPageIdentifier = 'bogus';

            it(`should return the expected error`, () => {
                const result = digitalText.translatePageContent(
                    missingPageIdentifier,
                    `translation text`,
                    LanguageCode.English
                );

                assertErrorAsExpected(
                    result,
                    new MissingPageError(missingPageIdentifier, digitalText.id)
                );
            });
        });

        describe(`when there is already content in the given language`, () => {
            it(`should return the expected errors`, () => {
                const result = digitalText.translatePageContent(
                    targetPageIdentifier,
                    'translation',
                    existingLanguageCode
                );

                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(digitalText.getCompositeIdentifier(), [])
                );
            });
        });

        describe(`when the page does not yet have content`, () => {
            it(`should return the expected error`, () => {
                const result = digitalText
                    .clone({
                        pages: [
                            new DigitalTextPage({
                                identifier: targetPageIdentifier,
                            }),
                        ],
                    })
                    .translatePageContent(
                        targetPageIdentifier,
                        'the translation',
                        translationLanguageCode
                    );

                assertErrorAsExpected(result, new MissingPageContentError(targetPageIdentifier));
            });
        });

        describe(`when the input is ill-formed`, () => {
            describe(`when the translation is an empty string`, () => {
                it(`should return an invariant validation error`, () => {
                    const result = digitalText.translatePageContent(
                        targetPageIdentifier,
                        '',
                        translationLanguageCode
                    );

                    assertErrorAsExpected(
                        result,
                        new InvariantValidationError(digitalText.getCompositeIdentifier(), [])
                    );
                });
            });
        });
    });
});
