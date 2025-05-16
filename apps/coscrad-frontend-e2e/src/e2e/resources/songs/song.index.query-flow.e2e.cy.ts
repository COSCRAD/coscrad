import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyUuid } from '../../../support/utilities';

const dummySongTitle = 'Mary had a little lamb';

const dummyEnglishTranslationOfSongTitle = `Mary's lamb ZZZ (English)`;

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.song,
    id: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`,
});

const mediaItemId = buildDummyUuid(12);

const audioItemId = buildDummyUuid(13);

const aggregateCompositeIdentifier = buildAggregateCompositeIdentifier('001');

describe(`Song Index-to-detail Query Flow`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(200);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: {
                type: AggregateType.mediaItem,
                id: mediaItemId,
            },
            mimeType: MIMEType.wav,
        });

        cy.seedDataWithCommand(`CREATE_AUDIO_ITEM`, {
            aggregateCompositeIdentifier: {
                type: AggregateType.audioItem,
                id: audioItemId,
            },
            mediaItemId,
        });

        cy.seedDataWithCommand(`CREATE_SONG`, {
            title: dummySongTitle,
            languageCodeForTitle: LanguageCode.Chilcotin,
            // titleEnglish: dummyEnglishTranslationOfSongTitle,
            aggregateCompositeIdentifier,
            audioItemId,
        });

        cy.seedDataWithCommand(`TRANSLATE_SONG_TITLE`, {
            aggregateCompositeIdentifier,
            translation: dummyEnglishTranslationOfSongTitle,
            languageCode: LanguageCode.English,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    });

    describe(`the index page`, () => {
        it.skip(`should display the label "Songs"`, () => {
            cy.contains(`Songs`);
        });

        describe(`when there is a single song`, () => {
            beforeEach(() => {
                cy.visit('/Resources/Songs');
            });

            describe(`when the song has a title in both languages`, () => {
                it(`should display the title in both languages`, () => {
                    cy.contains(dummySongTitle);

                    // TODO[https://www.pivotaltracker.com/story/show/185717928] seed data with a title translation
                    // cy.contains(dummyEnglishTranslationOfSongTitle);
                });
            });
        });

        describe(`the search filter`, () => {
            const songTitleWithQDash = `Q-Bert's JamZ`;

            const searchScopes = [`allProperties`, `name`];

            before(() => {
                cy.seedDataWithCommand(`CREATE_SONG`, {
                    title: songTitleWithQDash,
                    languageCodeForTitle: LanguageCode.Chilcotin,
                    aggregateCompositeIdentifier: buildAggregateCompositeIdentifier('052'),
                    audioItemId,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: buildAggregateCompositeIdentifier('052'),
                });
            });

            searchScopes.forEach((searchScope) => {
                describe(`when the search scope is: ${searchScope}`, () => {
                    beforeEach(() => {
                        cy.visit('/Resources/Songs');

                        cy.getByDataAttribute('select_index_search_scope').click();

                        cy.getByDataAttribute('select_index_search_scope')
                            .get(`[data-value="${searchScope}"]`)
                            .click();
                    });

                    describe(`when the filter should return 1 result (based on title)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `Q-`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(songTitleWithQDash);

                            cy.contains(dummySongTitle).should('not.exist');
                        });
                    });

                    describe(`when the filter should return 1 result (based on titleEnglish)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `ZZZ`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummySongTitle);

                            cy.contains(songTitleWithQDash).should('not.exist');
                        });
                    });

                    describe(`when the filter should return no results`, () => {
                        it(`should show no results`, () => {
                            const searchTerms = `BBQ ChickenZ`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummySongTitle).should(`not.exist`);

                            cy.contains(songTitleWithQDash).should('not.exist');

                            cy.getByDataAttribute(`not-found`);
                        });
                    });

                    describe(`when the filter should return all results`, () => {
                        it(`should show all results`, () => {
                            const searchTerms = `Z`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummySongTitle);

                            cy.contains(songTitleWithQDash);

                            cy.getByDataAttribute(`not-found`).should('not.exist');
                        });
                    });

                    /**
                     * For some strange reason, cy.contains seems to completely
                     * fail with the following special characters. The screenshot
                     * clearly shows the character on the screen, and yet it is
                     * not found. Further,
                     */
                    describe(`when searching by special character`, () => {
                        const keyBindings: [string, string][] = [
                            ['s[', 'ŝ'],
                            ['w[', 'ŵ'],
                            ['z[', 'ẑ'],
                            [']', 'ʔ'],
                            [';', 'ɨ'],
                            ["'", '’'],
                        ];

                        /**
                         * TODO We need to enable multiple simulated keyboard
                         * key bindings, include one for each orthography any
                         * language group needs, and then update this test coverage.
                         */
                        keyBindings.forEach(([keySequence, specialChar], index) => {
                            describe(`the special char: ${specialChar}`, () => {
                                beforeEach(() => {
                                    cy.seedDataWithCommand(`CREATE_SONG`, {
                                        title: `foo bar ${specialChar}`,
                                        languageCodeForTitle: LanguageCode.Chilcotin,
                                        aggregateCompositeIdentifier:
                                            buildAggregateCompositeIdentifier(`${index + 100}`),
                                        audioItemId,
                                    });

                                    cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                                        aggregateCompositeIdentifier:
                                            buildAggregateCompositeIdentifier(`${index + 100}`),
                                    });

                                    cy.visit(`/Resources/Songs`);

                                    cy.getByDataAttribute(`index_search_bar`).click();

                                    cy.getByDataAttribute(`index_search_bar`).type(keySequence);
                                });

                                describe(`when searching for a term with the special symbol`, () => {
                                    it(`should appear in the search bar`, () => {
                                        cy.contains('foo bar');

                                        cy.contains(`Mary`).should('not.exist');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
