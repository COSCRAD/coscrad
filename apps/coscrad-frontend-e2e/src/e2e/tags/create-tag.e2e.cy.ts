const commandLabel = `Create Tag`;

describe(`Create Tag`, () => {
    beforeEach(() => {
        cy.visit('/');

        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    describe(`when the user is logged in`, () => {
        const firstTagLabel = 'plants';

        beforeEach(() => {
            cy.login();

            cy.navigateToTagIndex();

            cy.contains(commandLabel).as('commandButton');
        });

        describe(`when the form is incomplete`, () => {
            it(`should disable submission`, () => {
                cy.get('@commandButton').click();

                cy.getCommandFormSubmissionButton().should('be.disabled');
            });
        });

        describe(`when the form is complete`, () => {
            describe(`when creating a single tag`, () => {
                it(`should succeed`, () => {
                    cy.get('@commandButton').click();

                    cy.getByDataAttribute('text_label').click().type(firstTagLabel);

                    cy.getCommandFormSubmissionButton().click();

                    cy.getByDataAttribute('error').should('not.exist');

                    cy.acknowledgeCommandResult();

                    cy.contains(firstTagLabel);
                });
            });

            describe(`when creating multiple tags`, () => {
                const secondTagLabel = 'robots';

                it(`should succeed`, () => {
                    cy.get('@commandButton').click();

                    cy.getByDataAttribute('text_label').click().type(firstTagLabel);

                    cy.getCommandFormSubmissionButton().click();

                    cy.getByDataAttribute('error').should('not.exist');

                    cy.acknowledgeCommandResult();

                    cy.get('@commandButton').click();

                    cy.getByDataAttribute('text_label').click().type(secondTagLabel);

                    cy.getCommandFormSubmissionButton().click();

                    cy.getByDataAttribute('error').should('not.exist');

                    cy.acknowledgeCommandResult();

                    cy.contains(secondTagLabel);
                });
            });

            describe(`when relabelling an existing tag`, () => {
                const newLabel = 'widgets';

                beforeEach(() => {
                    // TODO Use `execute-command-stream` to set up the state
                    cy.get('@commandButton').click();

                    cy.getByDataAttribute('text_label').click().type(firstTagLabel);

                    cy.getCommandFormSubmissionButton().click();

                    cy.getByDataAttribute('error').should('not.exist');

                    cy.acknowledgeCommandResult();
                });

                it(`should succeed`, () => {
                    // visit detail page for newly created tag
                    cy.contains(`VIEW`).click();

                    cy.contains(`Relabel Tag`).click();

                    cy.getByDataAttribute('text_newLabel').click().type(newLabel);

                    cy.getCommandFormSubmissionButton().click();

                    cy.acknowledgeCommandResult();

                    cy.contains(newLabel);
                });
            });

            describe(`when attempting to create a duplicate tag`, () => {
                beforeEach(() => {
                    // TODO Use `execute-command-stream` to set up the state
                    cy.get('@commandButton').click();

                    cy.getByDataAttribute('text_label').click().type(firstTagLabel);

                    cy.getCommandFormSubmissionButton().click();

                    cy.getByDataAttribute('error').should('not.exist');

                    cy.acknowledgeCommandResult();

                    // TODO Use `execute-command-stream` to set up the state
                    cy.get('@commandButton').click();

                    cy.getByDataAttribute('text_label').click().type(firstTagLabel);

                    cy.getCommandFormSubmissionButton().click();
                });

                it(`should fail with the expected error message`, () => {
                    cy.getByDataAttribute('loading').should('not.exist');

                    /**
                     * for some reason `data-testid='error'` doesn't work.
                     * MUI may be interfering as it's actually not present in
                     * the DOM.
                     */
                    cy.contains('Error');

                    cy.contains(firstTagLabel);

                    cy.contains('already in use');
                });
            });
        });
    });
});
