describe(`the auth flow`, () => {
    const loggedInMessage = 'Currently Logged In';

    beforeEach(() => {
        cy.visit('/');
    });

    describe(`when the user has yet to log in`, () => {
        it(`should display the log in button`, () => {
            cy.getByDataAttribute('logout-button').should('not.exist');

            cy.contains(loggedInMessage).should('not.exist');

            cy.getByDataAttribute('login-button');
        });
    });

    describe(`when the user has logged in`, () => {
        beforeEach(() => {
            cy.login();
        });

        it(`should display the log out button`, () => {
            cy.getByDataAttribute('login-button').should('not.exist');

            cy.getByDataAttribute('logout-button');
        });

        it(`should display the logged in message`, () => {
            cy.contains(loggedInMessage);
        });

        describe(`subsequent logout`, () => {
            it(`should work`, () => {
                cy.getByDataAttribute('logout-button').click();

                cy.getByDataAttribute('logout-button').should('not.exist');

                cy.contains(loggedInMessage).should('not.exist');

                cy.getByDataAttribute('login-button');
            });
        });
    });
});
