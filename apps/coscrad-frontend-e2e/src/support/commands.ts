// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        login(): void;
    }
}

// -- This is a parent command --
Cypress.Commands.add('login', () => {
    console.log(`logging in as ${Cypress.env('username')}`);

    // cy.request({
    //     method: 'POST',
    //     url: `https://${Cypress.env('auth0_domain')}/oauth/token`,
    //     body: {
    //         grant_type: 'password',
    //         username: Cypress.env('username'),
    //         password: Cypress.env('password'),
    //         audience: Cypress.env('auth0_audience'),
    //         scope: Cypress.env('auth0_scope'),
    //         client_id: Cypress.env('auth0_client_id'),
    //         client_secret: Cypress.env('auth0_client_secret'),
    //     },
    // });

    cy.contains('Log In').click();

    cy.get('#username').click().type(Cypress.env('username'));

    cy.get('#password').click().type(Cypress.env('password'));

    cy.contains('Continue').click();
});

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
