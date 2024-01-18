import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { DigitalText } from './digital-text.entity';

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const existingTranslationOfTitle = 'existing translation of title';

const existingTitleText = 'existing title text';

const existingBilingualTitle = buildMultilingualTextFromBilingualText(
    { text: existingTitleText, languageCode: originalLanguageCode },
    { text: existingTranslationOfTitle, languageCode: translationLanguageCode }
);

const existingMonolingualTitle = buildMultilingualTextWithSingleItem(
    existingTitleText,
    originalLanguageCode
);

const existingDigitalTextWithoutAudioForTitle = getValidAggregateInstanceForTest(
    AggregateType.digitalText
).clone({
    title: existingBilingualTitle,
    audioForTitle: MultilingualAudio.buildEmpty(),
});

const audioItemId = buildDummyUuid(117);

describe(`DigitalText.addAudioForTitle`, () => {
    describe(`when the update is valid`, () => {
        describe(`when there is only an original title`, () => {
            const digitalText = existingDigitalTextWithoutAudioForTitle.clone({
                title: existingMonolingualTitle,
            });

            it(`should return the updated digital text`, () => {
                const result = digitalText.addAudioForTitle(audioItemId, originalLanguageCode);

                expect(result).toBeInstanceOf(DigitalText);

                const updatedDigitalText = result as DigitalText;

                const audioIdSearchResult =
                    updatedDigitalText.getAudioForTitleInLanguage(originalLanguageCode);

                expect(audioIdSearchResult).toBe(audioItemId);
            });
        });

        describe(`when the audio is for translation text`, () => {
            const digitalText = existingDigitalTextWithoutAudioForTitle;

            it(`should return the updated digital text`, () => {
                const result = digitalText.addAudioForTitle(audioItemId, translationLanguageCode);

                expect(result).toBeInstanceOf(DigitalText);

                const updatedDigitalText = result as DigitalText;

                const audioIdSearchResult =
                    updatedDigitalText.getAudioForTitleInLanguage(translationLanguageCode);

                expect(audioIdSearchResult).toBe(audioItemId);
            });
        });
    });
});
