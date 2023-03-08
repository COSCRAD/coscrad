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

    /**
     * We ensure that any cached information about the previous session is
     * cleared before logging in.
     */
    cy.clearLocalStorage();

    const client_id = Cypress.env('auth0_client_id');

    const audience = Cypress.env('auth0_audience');

    const scope = Cypress.env('auth0_scope');

    cy.request({
        method: 'POST',
        url: `https://${Cypress.env('auth0_domain')}/oauth/token`,
        body: {
            grant_type: 'password',
            username: Cypress.env('username'),
            password: Cypress.env('password'),
            audience,
            scope,
            client_id,
            client_secret: Cypress.env('auth0_client_secret'),
        },
    }).then(({ body: { access_token, expires_in, id_token, token_type } }) => {
        cy.window().then((win) => {
            win.localStorage.setItem(
                `@@auth0spajs@@::${client_id}::${audience}::${scope}`,
                JSON.stringify({
                    body: {
                        client_id,
                        access_token,
                        id_token,
                        scope,
                        expires_in,
                        token_type,
                        decodedToken: {
                            user: JSON.parse(
                                Buffer.from(id_token.split('.')[1], 'base64').toString('ascii')
                            ),
                        },
                        audience,
                    },
                    expiresAt: Math.floor(Date.now() / 1000) + expires_in,
                })
            );
            cy.reload();
        });
    });

    // cy.contains('Log In').click();

    // cy.get('#username').click().type(Cypress.env('username'));

    // cy.get('#password').click().type(Cypress.env('password'));

    // cy.contains('Continue').click();
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
