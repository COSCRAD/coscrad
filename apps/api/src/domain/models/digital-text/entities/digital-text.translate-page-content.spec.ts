import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import DigitalTextPage from './digital-text-page.entity';
import { DigitalText } from './digital-text.entity';

const targetPageIdentifier = '12';

const existingPage = new DigitalTextPage({
    identifier: targetPageIdentifier,
    content: buildMultilingualTextWithSingleItem(`existing content`, LanguageCode.Chilcotin),
});

const digitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [existingPage],
});

describe(`DigitalText.translatePageContent`, () => {
    describe(`when the translation is valid`, () => {
        const translationText = `translation of content`;

        const translationLanguageCode = LanguageCode.English;

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
});
