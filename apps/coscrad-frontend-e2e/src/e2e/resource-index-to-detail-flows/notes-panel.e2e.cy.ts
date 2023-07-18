describe(`open self notes panel for resource`, () => {
    const photographBaseRoute = `/Resources/Photographs/`;

    const photographId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

    describe(`when the photograph detail full view has loaded`, () => {
        beforeEach(() => {
            cy.visit(`${photographBaseRoute}${photographId}`);
        });

        it(`should expose the open note panel button`, () => {
            cy.getByDataAttribute('open-notes-panel-button').should('exist');
        });

        describe(`the notes panel for a resource`, () => {
            it(`should not be open initially`, () => {
                cy.getByDataAttribute('notes-panel').should('not.exist');
            });

            describe(`when the notes panel button is clicked`, () => {
                beforeEach(() => {
                    cy.getByDataAttribute('open-notes-panel-button').click();
                });

                it(`should open the notes panel`, () => {
                    cy.getByDataAttribute('notes-panel').should('exist');
                });

                it(`should expose the notes panel close button`, () => {
                    cy.getByDataAttribute('close-notes-panel-button').should('be.visible');
                });

                it(`should expose the notes panel expand button`, () => {
                    cy.getByDataAttribute('expand-notes-panel-button').should('be.visible');
                });

                /**
                 * Note 1: the expand/contract panel tests may fail with different viewport heights, need to explore further.
                 *
                 * Note 2: testing the MUI  note drawer expansion/contraction is dependent/coupled to MUI's implementation of the
                 *          drawer because it's `.MuiPaper-root` that actually changes size
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

                        cy.getByDataAttribute('notes-panel').should('not.exist');
                    });
                });
            });
        });
    });
});
