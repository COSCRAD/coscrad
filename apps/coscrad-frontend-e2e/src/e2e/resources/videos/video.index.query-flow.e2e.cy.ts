import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';

const dummyVideoTitle = 'Dinosaur Video Title';

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.video,
    id: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`,
});

const aggregateCompositeIdentifier = buildAggregateCompositeIdentifier('001');

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

// TODO[https://www.pivotaltracker.com/story/show/185717928] seed data with a title translation and unskip this test
describe.skip(`Video Index-to-detail Query Flow`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(100);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            title: dummyVideoTitle,
            languageCodeForTitle: LanguageCode.Chilcotin,
            // titleEnglish: dummyEnglishTranslationOfVideoTitle,
            aggregateCompositeIdentifier,
            audioURL: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    });

    describe(`the index page`, () => {
        it.skip(`should display the label "Videos"`, () => {
            cy.contains(`Videos`);
        });

        describe(`when there is a single video`, () => {
            beforeEach(() => {
                cy.visit('/Resources/Videos');
            });

            describe(`when the video has a title in both languages`, () => {
                it(`should display the title in both languages`, () => {
                    cy.contains(dummyVideoTitle);

                    // TODO[https://www.pivotaltracker.com/story/show/185717928] seed data with a title translation
                    // cy.contains(dummyEnglishTranslationOfVideoTitle);
                });
            });
        });

        describe(`the search filter`, () => {
            const videoTitleWithQDash = `Q-Bert's Jam`;

            const searchScopes = [`allProperties`, `name`, `lengthMilliseconds`];

            before(() => {
                cy.seedDataWithCommand(`CREATE_VIDEO`, {
                    title: videoTitleWithQDash,
                    titleEnglish: undefined,
                    aggregateCompositeIdentifier: buildAggregateCompositeIdentifier('002'),
                    audioURL: validUrl,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: buildAggregateCompositeIdentifier('002'),
                });
            });

            searchScopes.forEach((searchScope) => {
                describe(`when the search scope is: ${searchScope}`, () => {
                    beforeEach(() => {
                        cy.visit('/Resources/Videos');

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

                            cy.contains(videoTitleWithQDash);

                            cy.contains(dummyVideoTitle).should('not.exist');
                        });
                    });

                    describe(`when the filter should return 1 result (based on titleEnglish)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `ZZZ`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummyVideoTitle);

                            cy.contains(videoTitleWithQDash).should('not.exist');
                        });
                    });

                    describe(`when the filter should return no results`, () => {
                        it(`should show no results`, () => {
                            const searchTerms = `BBQ Chicken`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummyVideoTitle).should(`not.exist`);

                            cy.contains(videoTitleWithQDash).should('not.exist');

                            cy.getByDataAttribute(`not-found`);
                        });
                    });

                    describe(`when the filter should return all results`, () => {
                        it(`should show all results`, () => {
                            const searchTerms = `n`;

                            cy.getByDataAttribute(`index_search_bar`).click().type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummyVideoTitle);

                            cy.contains(videoTitleWithQDash);

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
                                    cy.seedDataWithCommand(`CREATE_VIDEO`, {
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

                                    cy.visit(`/Resources/Videos`);

                                    cy.getByDataAttribute(`index_search_bar`)
                                        .click()
                                        .type(keySequence);
                                });

                                describe(`when searching for a term with the special symbol`, () => {
                                    it(`should appear in the search bar`, () => {
                                        cy.contains('foo bar');

                                        cy.contains(`Dinosaur`).should('not.exist');
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
