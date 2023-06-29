import { LanguageCode } from '@coscrad/api-interfaces';

const playlistBaseRoute = `/Resources/Playlists/`;

const commandLabel = `Create Playlist`;

const newPlaylistName = `Aaron's Mixtape`;

const languageCode = LanguageCode.English;

const getIdOfPlaylistToUpdate = () => `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110501`;

describe(`the command flow for playlists`, () => {
    beforeEach(() => {
        cy.visit(playlistBaseRoute);
    });

    describe(`when the user is not logged in as an admin`, () => {
        it(`should not display commands on the playlist index page`, () => {
            cy.contains(`Create Playlist`).should('not.exist');
        });
    });

    // TODO We must clear the database between runs
    describe(`when the user is logged in as an admin`, () => {
        beforeEach(() => {
            cy.login();
        });

        describe(`Playlist Index`, () => {
            beforeEach(() => {
                cy.navigateToIndex('playlist');
            });

            it(`should expose the CREATE_PLAYLIST command button`, () => {
                cy.contains(commandLabel);
            });

            describe(`when the command form is complete`, () => {
                it(`should create the new playlist`, () => {
                    cy.contains(commandLabel).click();

                    // eslint-disable-next-line
                    cy.get('#text-input_name').click().type(newPlaylistName);

                    cy.get('#mui-component-select-languageCodeForName')
                        .click()
                        .get(`[data-value="${languageCode}"]`)
                        .click();

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    // acknowledge the command's success
                    cy.get('[data-testid="command-ack-button"]').click();
                });
            });
        });

        describe(`Playlist Detail`, () => {
            beforeEach(() => {
                cy.navigateToIndex('playlist');

                cy.get(`[data-testid="${getIdOfPlaylistToUpdate()}"] > :nth-child(1) > a`).click();
            });

            describe(`when translating the playlist name`, () => {
                const translationForName = 'Unbelievable Playlist';

                const languageCodeForNameTranslation = LanguageCode.Haida;

                describe(`when the form is complete`, () => {
                    it.only(`should work`, () => {
                        cy.getByDataAttribute('loading').should('not.exist');

                        // TODO Use command label as the selector
                        cy.get('[data-testid="command-selection-area"] > :nth-child(3)').click();

                        cy.get('#mui-component-select-languageCode')
                            .click()
                            .get(`[data-value="${languageCodeForNameTranslation}"`)
                            .click();

                        cy.get('#text-input_text').click().type(translationForName);

                        cy.getByDataAttribute('submit-dynamic-form').click();

                        cy.get('[data-testid="command-ack-button"]').click();

                        cy.get(
                            '.MuiTypography-h3 > .MuiBox-root > .MuiPaper-root > .MuiAccordionSummary-root'
                        )
                            .click()
                            .contains(translationForName);
                    });
                });
            });
        });
    });
});
