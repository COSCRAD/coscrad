import { AggregateType } from '@coscrad/api-interfaces';

describe(`term detail flow`, () => {
    describe(`connect resources with note`, () => {
        const createConnectionCommandLabel = `Create Connection with Note`;

        const newNoteText = 'This is an interesting note.';

        const connectedVideoId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110223';

        const termId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002';

        /**
         * Note that this isn't that important right now based on the way
         * Auth0 redirects. But it might be important in the future when we
         * change that.
         */
        beforeEach(() => {
            cy.visit(`Resources/Terms`);
        });

        describe(`when the user is logged-in as COSCRAD admin`, () => {
            beforeEach(() => {
                cy.login();

                cy.getByDataAttribute('nav-menu-icon').click();

                cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

                cy.getByDataAttribute('term').click();

                // cy.get(`[data-testid="term/${termId}"] > :nth-child(1)`).click();

                cy.get(`[href="/Resources/Terms/${termId}"]`).click();
            });

            it(`should be avilable`, () => {
                cy.contains(createConnectionCommandLabel);
            });

            describe(`when the form is incomplete`, () => {
                beforeEach(() => {
                    cy.contains(createConnectionCommandLabel).click();

                    cy.getByDataAttribute('submit-dynamic-form').as('submit');
                });

                describe(`when the text is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                        cy.getByDataAttribute('global_resourceType_select')
                            .click()
                            .get('[data-value="video"]')
                            .click();

                        cy.getByDataAttribute('global_resourceId_select')
                            .click()
                            .get(`[data-value="${connectedVideoId}"]`)
                            .click();

                        cy.get('@submit').should('be.disabled');
                    });
                });

                describe(`when the language code is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_text').click().type(newNoteText);

                        cy.getByDataAttribute('global_resourceType_select')
                            .click()
                            .get('[data-value="video"]')
                            .click();

                        cy.getByDataAttribute('global_resourceId_select')
                            .click()
                            .get(`[data-value="${connectedVideoId}"]`)
                            .click();

                        cy.get('@submit').should('be.disabled');
                    });
                });

                describe(`when the to resource type is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_text').click().type(newNoteText);

                        cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                        cy.get('@submit').should('be.disabled');
                    });
                });

                describe(`when the to resource ID is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_text').click().type(newNoteText);

                        cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                        cy.getByDataAttribute('global_resourceType_select')
                            .click()
                            .get('[data-value="video"]')
                            .click();

                        cy.get('@submit').should('be.disabled');
                    });
                });
            });

            describe(`when the form is complete`, () => {
                beforeEach(() => {
                    cy.contains(createConnectionCommandLabel).click();

                    cy.get('#note_text').click().type(newNoteText);

                    cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                    cy.getByDataAttribute('global_resourceType_select')
                        .click()
                        .get('[data-value="video"]')
                        .click();

                    cy.getByDataAttribute('global_resourceId_select')
                        .click()
                        .get(`[data-value="${connectedVideoId}"]`)
                        .click();
                });

                it(`should be available`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').should('not.be.disabled');
                });

                it('should create the new connection', () => {
                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.acknowledgeCommandResult();

                    cy.getAggregateDetailView(AggregateType.video, connectedVideoId);
                });
            });
        });
    });
});
