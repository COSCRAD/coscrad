type CoscradBrowserPermissions = 'clipboard';

// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        login(email: string, password: string): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        grantPermissions(permissions: CoscradBrowserPermissions): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        assertValueCopiedToClipboard(value: string): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        getByDataAttribute(value: string, attributeSuffix?: string): Chainable<Subject>;
    }
}

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
    console.log('Custom command example: Login', email, password);
});

Cypress.Commands.add('assertValueCopiedToClipboard', (value) => {
    cy.window()
        .its('navigator.clipboard')
        .then((clip) => clip.readText())
        .should('equal', value);
});

Cypress.Commands.add('getByDataAttribute', (value: string, attributeSuffix = 'testid') =>
    cy.get(`[data-${attributeSuffix}="${value}"]`)
);

Cypress.Commands.add('grantPermissions', (permissionsToAdd: CoscradBrowserPermissions) => {
    if (permissionsToAdd === 'clipboard') {
        cy.wrap(
            Cypress.automation('remote:debugger:protocol', {
                command: 'Browser.grantPermissions',
                params: {
                    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
                    origin: window.location.origin,
                },
            })
        );

        return;
    }

    const exhaustiveCheck: never = permissionsToAdd;

    throw new Error(`Unrecognized permission type: ${exhaustiveCheck}`);
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
