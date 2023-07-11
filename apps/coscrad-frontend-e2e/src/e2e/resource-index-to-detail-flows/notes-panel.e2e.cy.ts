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
                cy.get('[data-testid="notes-panel"] > .MuiPaper-root').should('be.not.visible');
            });

            describe(`when the notes panel button is clicked`, () => {
                it(`should open the notes panel`, () => {
                    cy.getByDataAttribute('TextSnippetIcon').click();

                    cy.get('[data-testid="notes-panel"] > .MuiPaper-root').should('be.visible');
                });
            });
        });
    });
});
