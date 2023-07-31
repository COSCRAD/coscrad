import { AggregateType } from '@coscrad/api-interfaces';

const dummySongTitle = 'Mary had a little lamb';

const dummyEnglishTranslationOfSongTitle = `Mary's lamb ZZZ (English)`;

// const dummyUuid = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100001`;

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.song,
    id: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`,
});

const aggregateCompositeIdentifier = buildAggregateCompositeIdentifier('001');

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/mock-song-1_mary-had-a-little-lamb.wav';

describe(`Song Index-to-detail Query Flow`, () => {
    beforeEach(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    describe(`the index page`, () => {
        it.skip(`should display the label "Songs"`, () => {
            cy.contains(`Songs`);
        });

        describe(`when there is a single song`, () => {
            beforeEach(() => {
                cy.seedTestUuids(1);

                cy.seedDataWithCommand(`CREATE_SONG`, {
                    title: dummySongTitle,
                    titleEnglish: dummyEnglishTranslationOfSongTitle,
                    aggregateCompositeIdentifier,
                    audioURL: validUrl,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier,
                });

                cy.visit('/Resources/Songs');
            });

            describe(`when the song has a title in both languages`, () => {
                it(`should display the title in both languages`, () => {
                    cy.contains(dummySongTitle);

                    cy.contains(dummyEnglishTranslationOfSongTitle);
                });
            });
        });

        describe(`the search filter`, () => {
            const songTitleWithQDash = `Q-Bert's Jam`;

            const searchScopes = [`allProperties`, `name`];

            searchScopes.forEach((searchScope) => {
                describe(`when the search scope is: ${searchScope}`, () => {
                    beforeEach(() => {
                        cy.seedTestUuids(10);

                        cy.seedDataWithCommand(`CREATE_SONG`, {
                            title: dummySongTitle,
                            titleEnglish: dummyEnglishTranslationOfSongTitle,
                            aggregateCompositeIdentifier,
                            audioURL: validUrl,
                        });

                        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                            aggregateCompositeIdentifier,
                        });

                        cy.seedDataWithCommand(`CREATE_SONG`, {
                            title: songTitleWithQDash,
                            titleEnglish: undefined,
                            aggregateCompositeIdentifier: buildAggregateCompositeIdentifier('002'),
                            audioURL: validUrl,
                        });

                        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                            aggregateCompositeIdentifier: buildAggregateCompositeIdentifier('002'),
                        });

                        cy.visit('/Resources/Songs');

                        cy.getByDataAttribute('select_index_search_scope')
                            .click()
                            .get(`[data-value="${searchScope}"]`)
                            .click();
                    });

                    describe(`when the filter should return 1 result (based on title)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `Q-`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(songTitleWithQDash);

                            cy.contains(dummySongTitle).should('not.exist');
                        });
                    });

                    describe(`when the filter should return 1 result (based on titleEnglish)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `ZZZ`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummySongTitle);

                            cy.contains(songTitleWithQDash).should('not.exist');
                        });
                    });

                    describe(`when the filter should return no results`, () => {
                        it(`should show no results`, () => {
                            const searchTerms = `BBQ Chicken`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummySongTitle).should(`not.exist`);

                            cy.contains(songTitleWithQDash).should('not.exist');

                            cy.getByDataAttribute(`not-found`);
                        });
                    });

                    describe(`when the filter should return all results`, () => {
                        it(`should show all results`, () => {
                            const searchTerms = `n`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

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
                        keyBindings.forEach(([keySequence, specialChar]) => {
                            describe(`the special char: ${specialChar}`, () => {
                                beforeEach(() => {
                                    cy.seedDataWithCommand(`CREATE_SONG`, {
                                        title: `foo bar ${specialChar}`,
                                        titleEnglish: undefined,
                                        aggregateCompositeIdentifier:
                                            buildAggregateCompositeIdentifier('003'),
                                        audioURL: validUrl,
                                    });

                                    cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                                        aggregateCompositeIdentifier:
                                            buildAggregateCompositeIdentifier('003'),
                                    });

                                    cy.visit(`/Resources/Songs`);

                                    cy.getByDataAttribute(`index_search_bar`)
                                        .click()
                                        .type(keySequence);
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
