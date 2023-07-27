type CoscradBrowserPermissions = 'clipboard';

// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        login(): void;

        grantPermissions(permissions: CoscradBrowserPermissions): void;

        assertValueCopiedToClipboard(value: string): void;

        getByDataAttribute(value: string, attributeSuffix?: string): Chainable<Subject>;

        getAggregateDetailView(aggregateType: string, id: string): void;

        navigateToResourceIndex(resourceType: string): Chainable<Subject>;

        navigateToTagIndex(): void;

        clearDatabase(): Chainable<Subject>;

        executeCommandStreamByName(name: string): Chainable<Subject>;

        seedDataWithCommand(type: string, payloadOverrides: Record<string, unknown>): void;

        seedTestUuids(quantity: number): void;

        acknowledgeCommandResult(): void;

        openPanel(panelType: 'notes' | 'connections'): void;

        getCommandFormSubmissionButton(): Chainable<Subject>;

        getLoading(): Chainable<Subject>;
    }
}

// TODO We may want to allow several test users with different roles
Cypress.Commands.add('login', () => {
    console.log(`logging in as ${Cypress.env('username')}`);

    /**
     * We ensure that any cached information about the previous session is
     * cleared before logging in.
     */
    // cy.clearLocalStorage();

    // const client_id = Cypress.env('auth0_client_id');

    // const audience = Cypress.env('auth0_audience');

    // const scope = Cypress.env('auth0_scope');

    // cy.request({
    //     method: 'POST',
    //     url: `https://${Cypress.env('auth0_domain')}/oauth/token`,
    //     body: {
    //         grant_type: 'password',
    //         username: Cypress.env('username'),
    //         password: Cypress.env('password'),
    //         audience,
    //         scope,
    //         client_id,
    //         client_secret: Cypress.env('auth0_client_secret'),
    //     },
    // }).then(({ body: { access_token, expires_in, id_token, token_type } }) => {
    //     cy.window().then((win) => {
    //         win.localStorage.setItem(
    //             `@@auth0spajs@@::${client_id}::${audience}::${scope}`,
    //             JSON.stringify({
    //                 body: {
    //                     client_id,
    //                     access_token,
    //                     id_token,
    //                     scope,
    //                     expires_in,
    //                     token_type,
    //                     decodedToken: {
    //                         user: JSON.parse(
    //                             Buffer.from(id_token.split('.')[1], 'base64').toString('ascii')
    //                         ),
    //                     },
    //                     audience,
    //                 },
    //                 expiresAt: Math.floor(Date.now() / 1000) + expires_in,
    //             })
    //         );
    //         cy.reload();
    //     });
    // });

    cy.getByDataAttribute('login-button').click();

    cy.get('#username').click().type(Cypress.env('username'));

    cy.get('#password').click().type(Cypress.env('password'));

    // TODO why doesn't cy.contains("Continue") work?
    cy.getByDataAttribute('true', 'action-button-primary').click();
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

Cypress.Commands.add('navigateToResourceIndex', (resourceType: string) => {
    cy.getByDataAttribute('nav-menu-icon').click();

    cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

    cy.getByDataAttribute(resourceType).click();
});

Cypress.Commands.add(`navigateToTagIndex`, () => {
    cy.getByDataAttribute('nav-menu-icon').click();

    cy.get('[href="/Tags"] > .MuiButtonBase-root').click();
});

Cypress.Commands.add(`clearDatabase`, () =>
    cy.exec(`node ../../dist/apps/coscrad-cli/main.js clear-database`)
);

Cypress.Commands.add(`executeCommandStreamByName`, (name: string) =>
    cy.exec(`node ../../dist/apps/coscrad-cli/main.js execute-command-stream --name=${name}`)
);

Cypress.Commands.add(
    `seedDataWithCommand`,
    (type: string, payloadOverrides: Record<string, unknown>) => {
        const serializedOverrides = JSON.stringify(payloadOverrides);

        // "{\\"foo\\": 5}"
        const command = `node ../../dist/apps/coscrad-cli/main.js seed-test-data-with-command --type=${type} --payload-overrides="${serializedOverrides.replace(
            /"/g,
            `\\"`
        )}"`;

        cy.exec(command);

        // .then((result) => {
        //     cy.wrap(result).its('code').should('eq', 0);

        //     cy.wrap(`${result}`);
        // });
    }
);

Cypress.Commands.add(`seedTestUuids`, (quantity: number) => {
    cy.exec(`node ../../dist/apps/coscrad-cli/main.js seed-test-uuids --quantity=${quantity}`);
});

Cypress.Commands.add(`getCommandFormSubmissionButton`, () =>
    cy.getByDataAttribute('submit-dynamic-form')
);

Cypress.Commands.add(`acknowledgeCommandResult`, () => {
    cy.getByDataAttribute(`command-ack-button`).click();
});

Cypress.Commands.add(`getAggregateDetailView`, (aggregateType: string, id: string) => {
    cy.getByDataAttribute(`${aggregateType}/${id}`);
});

Cypress.Commands.add(`getLoading`, () => cy.getByDataAttribute(`loading`));

Cypress.Commands.add(`openPanel`, (panelType: 'notes' | 'connections') => {
    if (panelType === 'notes') {
        cy.getByDataAttribute(`open-notes-panel-button`).click();
        return;
    }

    if (panelType === 'connections') {
        cy.getByDataAttribute(`open-connections-panel-button`).click();
        return;
    }

    throw new Error(`Failed to open panel of unknown type: ${panelType}`);
});
