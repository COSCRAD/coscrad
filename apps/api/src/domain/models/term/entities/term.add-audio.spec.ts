import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CannotReuseAudioItemError } from '../../shared/multilingual-audio/errors';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { CannotOverrideAudioForTermError } from '../errors';
import { Term } from './term.entity';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const existingText = buildMultilingualTextFromBilingualText(
    { text: 'original text', languageCode: originalLanguageCode },
    { text: 'translation text', languageCode: translationLanguageCode }
);

const term = getValidAggregateInstanceForTest(AggregateType.term).clone({
    text: existingText,
    audio: new MultilingualAudio({
        // empty
        items: [],
    }),
});

const audioItemId = buildDummyUuid(55);

describe(`Term.addAudio`, () => {
    describe(`when the input is valid`, () => {
        describe(`when the audio targets the original language`, () => {
            it(`should link the audio ID to the term`, () => {
                const result = term.addAudio(audioItemId, originalLanguageCode);

                expect(result).toBeInstanceOf(Term);

                const updatedTerm = result as Term;

                expect(updatedTerm.hasAudio()).toBe(true);

                expect(updatedTerm.getIdForAudioIn(originalLanguageCode)).toBe(audioItemId);
            });
        });

        describe(`when the audio targest a translation language`, () => {
            it(`should link the audio ID to the term`, () => {
                const result = term.addAudio(audioItemId, translationLanguageCode);

                expect(result).toBeInstanceOf(Term);

                const updatedTerm = result as Term;

                expect(updatedTerm.hasAudio()).toBe(true);

                expect(updatedTerm.getIdForAudioIn(translationLanguageCode)).toBe(audioItemId);
            });
        });
    });

    describe(`when the input in invalid`, () => {
        describe(`when the term already has audio for the given language`, () => {
            const existingAudioItemId = buildDummyUuid(864);

            it(`should fail with the expected error`, () => {
                const termWithAudio = term.addAudio(
                    existingAudioItemId,
                    originalLanguageCode
                ) as Term;

                const result = termWithAudio.addAudio(audioItemId, originalLanguageCode);

                assertErrorAsExpected(
                    result,
                    new CannotOverrideAudioForTermError(
                        term.id,
                        originalLanguageCode,
                        audioItemId,
                        existingAudioItemId
                    )
                );
            });
        });

        describe(`when the audio ID is already in use`, () => {
            it(`should return the expected error`, () => {
                const termWithIdAlready = term.addAudio(audioItemId, originalLanguageCode) as Term;

                const result = termWithIdAlready.addAudio(audioItemId, translationLanguageCode);

                assertErrorAsExpected(result, new CannotReuseAudioItemError(audioItemId));
            });
        });

        describe(`when there is no text in the target language`, () => {
            it.todo(`should have a test`);
        });

        describe(`when the audio id is an empty string`, () => {
            it(`should fail with an error`, () => {
                const result = term.addAudio('', originalLanguageCode);

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
