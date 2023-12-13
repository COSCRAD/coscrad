import {
    LegacyTerm,
    buildCommandStreamForLegacyTerm,
} from './build-command-stream-for-legacy-term';

const dummyOldId = '45678';

const termText = 'I am running (lang)';

const termEnglishText = 'I am running (engl)';

const contributorWithPromptTerms = '1';

const _contributorWithTranslationTerms = '2';

const audioFilename = 'scrabble.mp3';

const sourceId = '2';

describe(`buildCommandStreamForLegacyTerm`, () => {
    describe(`when the term has text in both languges`, () => {
        describe(`it should emit the correct commands`, () => {
            const legacyTerm: LegacyTerm = {
                _key: dummyOldId,
                _id: `terms/${dummyOldId}`,
                _rev: '_ds6eKEK---',
                published: true,
                term: termText,
                termEnglish: termEnglishText,
                contributorId: contributorWithPromptTerms,
                audioFilename,
                sourceId,
            };

            const result = buildCommandStreamForLegacyTerm(legacyTerm);

            it(`should return the expected command stream`, () => {
                /**
                 * Visual inspection works well for this task.
                 */
                expect(result).toMatchSnapshot();
            });
        });
    });
});
