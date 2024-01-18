import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotOverrideAudioForLanguageError } from '../../shared/multilingual-audio/errors';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { CannotAddAudioForTitleInGivenLanguageError } from '../errors/cannot-add--audio-for-title-in-given-language.error';
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

    describe(`when the update is invalid`, () => {
        describe(`when there is no text in the target language`, () => {
            it(`should fail with the expected error`, () => {
                const languageCodeWithNoTitleTranslation = LanguageCode.Chinook;

                const result = existingDigitalTextWithoutAudioForTitle.addAudioForTitle(
                    audioItemId,
                    languageCodeWithNoTitleTranslation
                );

                assertErrorAsExpected(
                    result,
                    new CannotAddAudioForTitleInGivenLanguageError(
                        existingDigitalTextWithoutAudioForTitle.id,
                        audioItemId,
                        languageCodeWithNoTitleTranslation
                    )
                );
            });
        });

        describe(`when there is already audio for the given language`, () => {
            it(`should fail with the expected error`, () => {
                const digitalTextWithAudio =
                    existingDigitalTextWithoutAudioForTitle.addAudioForTitle(
                        audioItemId,
                        originalLanguageCode
                    ) as DigitalText;

                const secondAudioItemId = buildDummyUuid(99);

                const result = digitalTextWithAudio.addAudioForTitle(
                    secondAudioItemId,
                    originalLanguageCode
                );

                assertErrorAsExpected(
                    result,
                    new CannotOverrideAudioForLanguageError(
                        originalLanguageCode,
                        secondAudioItemId,
                        audioItemId
                    )
                );
            });
        });

        describe(`when the audio item Id is an empty string`, () => {
            it(`should fail`, () => {
                const result = existingDigitalTextWithoutAudioForTitle.addAudioForTitle(
                    '',
                    originalLanguageCode
                );

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
