describe(`open connected resources panel for resource`, () => {
    const transcribedAudioBaseRoute = `/Resources/AudioItems/`;

    const transcribedAudioId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110110`;

    describe(`when the transcribed audio detail full view has loaded`, () => {
        beforeEach(() => {
            cy.visit(`${transcribedAudioBaseRoute}${transcribedAudioId}`);
        });

        it(`should expose the open connected resources panel button`, () => {
            cy.getByDataAttribute('open-connected-resource-panel-button').should('exist');
        });

        describe(`the connected resources panel`, () => {
            it(`should not be open initially`, () => {
                cy.getByDataAttribute('connected-resources-panel').should('not.exist');
            });

            describe(`when the connected resources panel button is clicked`, () => {
                beforeEach(() => {
                    cy.getByDataAttribute('open-connected-resource-panel-button').click();
                });

                it(`should open the connected resources panel`, () => {
                    cy.getByDataAttribute('connected-resources-panel').should('exist');
                });

                describe(`when the close panel button is clicked`, () => {
                    it(`should close the connected resources panel`, () => {
                        cy.getByDataAttribute('close-connected-resources-panel-button').click();

                        cy.getByDataAttribute('connected-resources-panel').should('not.exist');
                    });
                });
            });
        });
    });
});
