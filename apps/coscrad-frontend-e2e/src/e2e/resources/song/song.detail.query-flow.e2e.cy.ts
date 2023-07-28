import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';

const songTitleInLanguage = `The La La Song`;

const originalLanguageCode = LanguageCode.Haida;

const buildId = (id: string) => `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`;

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.song,
    id: buildId(id),
});

const songAggregateCompositeIdentifier = buildAggregateCompositeIdentifier('001');

const songDetailRoute = `/Resources/Songs/${songAggregateCompositeIdentifier.id}`;

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/mock-song-1_mary-had-a-little-lamb.wav';

const lyrics = `la la la (that's the jam)`;

const lyricsTranslation = `la la la (but in English!)`;

describe(`the song detail page`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(10);

        // TODO We'll need to update this when there's a proper translation flow
        cy.seedDataWithCommand(`CREATE_SONG`, {
            title: songTitleInLanguage,
            aggregateCompositeIdentifier: songAggregateCompositeIdentifier,
            audioURL: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: songAggregateCompositeIdentifier,
        });
    });

    beforeEach(() => {
        cy.visit(songDetailRoute);
    });

    describe(`when visiting the detail route with a bogus ID`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Songs/${buildId('987')}`);

            cy.getByDataAttribute('not-found');
        });
    });

    /**
     * This is a smoke test to ensure we don't have issues with null check errors,
     * for example.
     */
    describe(`when the song is missing optional properties`, () => {
        it(`should display the song title`, () => {
            cy.contains(songTitleInLanguage);
        });
    });

    // let playedUrls: string[] = [];

    // const OriginalAudio = window.Audio;

    /**
     * - When the song has only title English
     * - When the song has only title in language
     * - When the song has no audio url?
     * - when the song has an invalid audio url
     * -
     */
    describe(`when the song has all properties`, () => {
        before(() => {
            cy.seedDataWithCommand(`ADD_LYRICS_FOR_SONG`, {
                aggregateCompositeIdentifier: songAggregateCompositeIdentifier,
                lyrics,
                languageCode: originalLanguageCode,
            });

            cy.seedDataWithCommand(`TRANSLATE_SONG_LYRICS`, {
                aggregateCompositeIdentifier: songAggregateCompositeIdentifier,
                translation: lyricsTranslation,
                languageCode: LanguageCode.English,
            });
        });

        beforeEach(() => {
            // playedUrls = [];

            // TODO troubleshoot this
            cy.spy(window.Audio.prototype, 'play');
        });

        it(`should render the song title`, () => {
            cy.contains(songTitleInLanguage);
        });

        it(`should display the lyrics`, () => {
            cy.contains(lyrics);
        });

        it(`should display the lyrics' translation`, () => {
            cy.getLoading().should('not.exist');

            cy.contains(`Translations`).click();

            cy.contains(lyricsTranslation);
        });

        /**
         * We don't need to test the functionality of the copy ID button, as this
         * is done elsewhere. We merely check that it is available here.
         */
        it(`should expose the copy ID button`, () => {
            cy.getByDataAttribute(`copy-id`);
        });

        // TODO verify this
        it.skip(`should play the audio`, () => {
            cy.getByDataAttribute(`audio-for-${validUrl}`).click();
            // TODO spy on Audio and assert it gets played.

            expect(window.Audio.prototype.play).to.be.calledOnce;
        });

        describe(`the connection and notes panels`, () => {
            describe(`when there are no notes or connections`, () => {
                it(`should display No Notes`, () => {
                    cy.getByDataAttribute(`open-notes-panel-button`).click();

                    cy.contains(`No Notes`);
                });

                it(`should display No Connections`, () => {
                    cy.getByDataAttribute(`open-connected-resources-panel-button`).click();

                    cy.contains(`No Connections`);
                });
            });

            describe(`when there is a note`, () => {
                const noteText = `This is about bunnies.`;

                describe(`with general context`, () => {
                    beforeEach(() => {
                        cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
                            aggregateCompositeIdentifier: {
                                id: buildId(`002`),
                                type: AggregateType.note,
                            },
                            resourceCompositeIdentifier: songAggregateCompositeIdentifier,
                            text: noteText,
                        });

                        cy.visit(songDetailRoute);
                    });

                    it(`should display the note`, () => {
                        cy.getByDataAttribute(`open-notes-panel-button`).click();

                        cy.contains(noteText);
                    });

                    it(`should close the notes panel on demand`, () => {
                        cy.getByDataAttribute(`open-notes-panel-button`).click();

                        cy.contains(noteText);

                        cy.getByDataAttribute(`close-notes-panel-button`).click();

                        cy.contains(noteText).should('not.exist');
                    });
                });
            });

            describe(`when there is a connection`, () => {
                const connectingNoteText = `that is why this song is connected to that term`;

                const termText = `Robot`;

                const termCompositeIdentifier = {
                    type: AggregateType.term,
                    id: buildId(`003`),
                };

                beforeEach(() => {
                    // create the connected term
                    // TODO We'll need to update this when there's a proper translation flow
                    cy.seedDataWithCommand(`CREATE_TERM`, {
                        aggregateCompositeIdentifier: termCompositeIdentifier,
                        text: termText,
                    });

                    // publish the connected term
                    cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                        aggregateCompositeIdentifier: termCompositeIdentifier,
                    });

                    cy.seedDataWithCommand(`CONNECT_RESOURCES_WITH_NOTE`, {
                        aggregateCompositeIdentifier: {
                            type: AggregateType.note,
                            id: buildId(`004`),
                        },
                        fromMemberCompositeIdentifier: songAggregateCompositeIdentifier,
                        toMemberCompositeIdentifier: termCompositeIdentifier,
                        text: connectingNoteText,
                    });
                });

                // Note that the connected resource panel does not currently display the note text
                it.skip(`should display the note for the connection`, () => {
                    cy.getByDataAttribute(`open-connected-resources-panel-button`).click();

                    cy.contains(connectingNoteText);

                    cy.contains(termText);
                });

                it(`should close the connected resources panel on demand`, () => {
                    cy.getByDataAttribute(`open-connected-resources-panel-button`).click();

                    cy.contains(`Connected Resources`);

                    cy.getByDataAttribute(`close-connected-resources-panel-button`).click();

                    cy.contains(`Connected Resources`).should('not.be.visible');
                });
            });
        });
    });

    // TODO test this case
    describe.skip(`when the audioUrl is invalid`, () => {
        const compositeIdForSongWithInvalidAudioUrl = buildAggregateCompositeIdentifier('005');

        const bogusUrl = `https://www.coscrad.org/i-do-not-exist.mp3`;

        beforeEach(() => {
            // TODO We'll need to update this when there's a proper translation flow
            cy.seedDataWithCommand(`CREATE_SONG`, {
                title: `my audio URL is bogus`,
                aggregateCompositeIdentifier: compositeIdForSongWithInvalidAudioUrl,
                audioURL: bogusUrl,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: compositeIdForSongWithInvalidAudioUrl,
            });
        });

        it(`should fail gracefully`, () => {
            cy.getByDataAttribute(`audio-for-${bogusUrl}`).click();

            // Ideally, we want to display the disabled icon once we find out that the URL doesn't work
            cy.getByDataAttribute('error').should('not.exist');
        });
    });
});
