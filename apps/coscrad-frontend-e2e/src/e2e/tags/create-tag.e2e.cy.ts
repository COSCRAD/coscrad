const commandLabel = `Create Tag`;

describe(`Create Tag`, () => {
    beforeEach(() => {
        cy.visit('/');

        cy.clearDatabase();

        cy.executeCommandStream('users:create-admin');
    });

    describe(`when the user is logged in`, () => {
        const firstTagLabel = 'plants';

        beforeEach(() => {
            cy.login();

            cy.navigateToTagIndex();

            cy.contains(commandLabel).as('commandButton');
        });

        describe(`when the form is complete`, () => {
            it.only(`should succeed`, () => {
                cy.get('@commandButton').click();

                cy.getByDataAttribute('text_label').click().type(firstTagLabel);

                cy.getCommandFormSubmissionButton().click();

                cy.getByDataAttribute('error').should('not.exist');
            });
        });
    });
});
