describe(`open connected resources panel for resource`, () => {
    const transcribedAudioBaseRoute = `/Resources/AudioItems/`;

    const transcribedAudioId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110110`;

    describe(`when opening the connected resources panel for a resource`, () => {
        beforeEach(() => {
            cy.visit(`${transcribedAudioBaseRoute}${transcribedAudioId}`);
        });

        describe(`when the transcribed audio detail full view has loaded`, () => {
            it(`should expose the open connected resources panel button`, () => {
                cy.getByDataAttribute('HubIcon').should('exist');
            });

            it(`should not expose the panel`, () => {
                cy.get('[data-testid="connected-resources-panel"] > .MuiPaper-elevation0').should(
                    'be.not.visible'
                );
            });

            describe(`when the connected resources panel button is clicked`, () => {
                it(`should open the connected resources panel`, () => {
                    cy.getByDataAttribute('HubIcon').click();

                    cy.get(
                        '[data-testid="connected-resources-panel"] > .MuiPaper-elevation0'
                    ).should('be.visible');
                });
            });
        });
    });
});
