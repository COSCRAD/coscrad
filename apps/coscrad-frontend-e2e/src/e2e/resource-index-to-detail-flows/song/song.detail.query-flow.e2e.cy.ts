import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';

const songTitleInLanguage = `The La La Song`;

const originalLanguageCode = LanguageCode.Haida;

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.song,
    id: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`,
});

const aggregateCompositeIdentifier = buildAggregateCompositeIdentifier('001');

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/mock-song-1_mary-had-a-little-lamb.wav';

const lyrics = `la la la (that's the jam)`;

describe(`the song detail page`, () => {
    let audios: HTMLAudioElement[];

    const OriginalAudio = window.Audio;

    beforeEach(() => {
        audios = [];

        cy.stub(window, 'Audio').callsFake((url: string) => {
            const newAudio = new OriginalAudio(url);

            audios.push(newAudio);

            return newAudio;
        });
    });

    describe(`when the song has all properties`, () => {
        before(() => {
            cy.clearDatabase();

            cy.seedTestUuids(1);

            cy.seedDataWithCommand(`CREATE_SONG`, {
                title: songTitleInLanguage,
                aggregateCompositeIdentifier,
                audioURL: validUrl,
            });

            cy.seedDataWithCommand(`ADD_LYRICS_FOR_SONG`, {
                aggregateCompositeIdentifier,
                lyrics,
                languageCode: originalLanguageCode,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit(`/Resources/Songs/${aggregateCompositeIdentifier.id}`);
        });

        it(`should render the song`, () => {
            cy.contains(songTitleInLanguage);
        });

        it(`should display the lyrics`, () => {
            cy.contains(lyrics);
        });

        it(`should play the audio`, () => {
            cy.getByDataAttribute('audio-clip-play-button').click();
            // TODO spy on Audio and assert it gets played.

            cy.wrap(audios).should('have.length', 1);
        });
    });
});
