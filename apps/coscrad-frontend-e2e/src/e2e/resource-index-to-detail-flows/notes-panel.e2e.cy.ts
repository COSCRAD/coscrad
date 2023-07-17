describe(`open self notes panel for resource`, () => {
    const photographBaseRoute = `/Resources/Photographs/`;

    const photographId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

    describe(`when opening the self notes panel for a resource`, () => {
        beforeEach(() => {
            cy.visit(`${photographBaseRoute}${photographId}`);
        });

        describe(`when the photograph detail full view has loaded`, () => {
            it(`should expose the open note panel button`, () => {
                cy.getByDataAttribute('TextSnippetIcon').should('exist');
            });

            it(`should not expose the panel`, () => {
                cy.get('[data-testid="notes-panel"] > .MuiPaper-root').should('not.exist');
            });

            describe(`when the notes panel button is clicked`, () => {
                beforeEach(() => {
                    cy.getByDataAttribute('open-notes-panel-button').click();
                });

                it(`should open the notes panel`, () => {
                    cy.get('[data-testid="notes-panel"]').should('be.visible');
                });

                describe(`when the notes panel is open`, () => {
                    it(`should expose the notes panel close button`, () => {
                        cy.getByDataAttribute('close-notes-panel-button').should('be.visible');
                    });

                    it(`should expose the notes panel expand button`, () => {
                        cy.getByDataAttribute('expand-notes-panel-button').should('be.visible');
                    });
                });

                /**
                 * Note 1: this test may fail with different viewport heights, need to test further.
                 *
                 * Note 2: testing the MUI drawer is dependent/coupled to MUI's implementation of the
                 *          drawer so this test will need to be re-written if we don't use MUI
                 */
                describe(`when the expand panel button is clicked`, () => {
                    const minExpandedPanelHeight = Cypress.config().viewportHeight * 0.8;

                    it(`should expand the notes panel`, () => {
                        cy.getByDataAttribute('expand-notes-panel-button').click();

                        cy.get('[data-testid="notes-panel"] > .MuiPaper-root')
                            .invoke('outerHeight')
                            .should('be.gte', minExpandedPanelHeight);
                    });
                });

                describe(`when the expand panel button is clicked a second time to contract the panel`, () => {
                    const minExpandedPanelHeight = Cypress.config().viewportHeight * 0.8;

                    it(`should contract the notes panel`, () => {
                        cy.getByDataAttribute('expand-notes-panel-button').click();
                        cy.getByDataAttribute('expand-notes-panel-button').click();

                        cy.get('[data-testid="notes-panel"] > .MuiPaper-root')
                            .invoke('outerHeight')
                            .should('be.lt', minExpandedPanelHeight);
                    });
                });

                describe(`when the close panel button is clicked`, () => {
                    it(`should close the notes panel`, () => {
                        cy.getByDataAttribute('close-notes-panel-button').click();

                        cy.get('[data-testid="notes-panel"]').should('not.exist');
                    });
                });
            });
        });
    });
});
