import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { MissingPageError } from '../errors';
import { CannotOverrideAudioForPageError } from '../errors/cannot-override-audio-for-page.error';
import DigitalTextPage from './digital-text-page.entity';
import { DigitalText } from './digital-text.entity';

const targetPageIdentifier = 'X';

const originalLanguageCode = LanguageCode.Chilcotin;

const existingPageWithoutAudio = new DigitalTextPage({
    identifier: targetPageIdentifier,
    content: buildMultilingualTextWithSingleItem('target text', originalLanguageCode),
    audio: new MultilingualAudio({
        items: [],
    }),
});

const digitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [existingPageWithoutAudio],
});

const audioItemId = buildDummyUuid(444);

describe(`DigitalText.addAudioForPage`, () => {
    describe(`when the update is valid`, () => {
        it(`should return the updated page`, () => {
            const result = digitalText.addAudioForPage(
                existingPageWithoutAudio.identifier,
                audioItemId,
                originalLanguageCode
            );

            expect(result).toBeInstanceOf(DigitalText);

            const updatedDigitalText = result as DigitalText;

            const pageSearchResult = updatedDigitalText.getPage(
                targetPageIdentifier
            ) as DigitalTextPage;

            const audioItemIdSearchResult =
                pageSearchResult.audio.getIdForAudioIn(originalLanguageCode);

            expect(audioItemIdSearchResult).toBe(audioItemId);
        });
    });

    describe(`when the update is invalid`, () => {
        describe(`when there is no page with the given identifier`, () => {
            it(`should return the expected error`, () => {
                const missingPage = '55';

                const result = digitalText.addAudioForPage(
                    missingPage,
                    audioItemId,
                    originalLanguageCode
                );

                assertErrorAsExpected(result, new MissingPageError(missingPage, digitalText.id));
            });
        });

        describe(`when there is already audio for the given page in the given language`, () => {
            const existingAudioItemId = buildDummyUuid(145);

            it(`should return the expected error`, () => {
                const digitalTextWithAudioAlready = digitalText.addAudioForPage(
                    targetPageIdentifier,
                    existingAudioItemId,
                    originalLanguageCode
                ) as DigitalText;

                const result = digitalTextWithAudioAlready.addAudioForPage(
                    targetPageIdentifier,
                    audioItemId,
                    originalLanguageCode
                );

                assertErrorAsExpected(
                    result,
                    new CannotOverrideAudioForPageError(
                        targetPageIdentifier,
                        audioItemId,
                        existingAudioItemId
                    )
                );
            });
        });
    });
});
