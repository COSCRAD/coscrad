import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { DigitalText } from '.';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import DigitalTextPage from './digital-text-page.entity';

const pageIdentifier = '6v';

const textContent = 'Hello world';

const translation = 'hello world translated';

const audioItemIdForOriginalLanguage = buildDummyUuid(1);

const audioItemIdForTranslationLanguage = buildDummyUuid(3);

const photographId = buildDummyUuid(2);

const originalLangaugeCode = LanguageCode.Chinook;

const translationLanguageCode = LanguageCode.Chilcotin;

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [],
});

describe(`DigitalText.ImportPages`, () => {
    describe(`when the page is imported with all optional properties specified`, () => {
        it(`should succeed`, () => {
            const result = existingDigitalText.importPages([
                {
                    pageIdentifier,
                    audioAndTextContent: [
                        {
                            text: textContent,
                            languageCode: originalLangaugeCode,
                            isOriginalText: true,
                            audioItemId: audioItemIdForOriginalLanguage,
                        },
                        {
                            text: translation,
                            languageCode: translationLanguageCode,
                            isOriginalText: false,
                            audioItemId: audioItemIdForTranslationLanguage,
                        },
                    ],
                    photographId,
                },
            ]);

            expect(result).toBeInstanceOf(DigitalText);

            const updatedText = result as DigitalText;

            const pageSearch = updatedText.getPage(pageIdentifier);

            expect(pageSearch).toBeInstanceOf(DigitalTextPage);

            const targetPage = pageSearch as DigitalTextPage;

            const pageContent = targetPage.getContent() as MultilingualText;

            const originalTextSearch = pageContent.getOriginalTextItem();

            expect(originalTextSearch.text).toBe(textContent);

            expect(originalTextSearch.languageCode).toBe(originalLangaugeCode);

            const translationTextSearch = pageContent.getTranslation(translationLanguageCode);

            expect(translationTextSearch).toBeInstanceOf(MultilingualTextItem);

            const { text: foundTranslationText, languageCode: foundTranslationLanguageCode } =
                translationTextSearch as MultilingualTextItem;

            expect(foundTranslationText).toBe(translation);

            expect(foundTranslationLanguageCode).toBe(translationLanguageCode);

            expect(targetPage.getAudioIn(originalLangaugeCode)).toBe(
                audioItemIdForOriginalLanguage
            );

            expect(targetPage.getAudioIn(translationLanguageCode)).toBe(
                audioItemIdForTranslationLanguage
            );

            expect(targetPage.photographId).toBe(photographId);
        });
    });
});
