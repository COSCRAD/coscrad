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

        seedDataWithCommand(
            type: string,
            payloadOverrides: Record<string, unknown>,
            metaOverrides?: Record<string, unknown>
        ): void;

        seedDatabase(collectionName: string, documents: unknown[]): void;

        seedTestUuids(quantity: number): void;

        acknowledgeCommandResult(): void;

        openPanel(panelType: 'notes' | 'connections'): void;

        getCommandFormSubmissionButton(): Chainable<Subject>;

        getLoading(): Chainable<Subject>;

        filterTable(searchScope: string, searchText: string): void;
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

    // TODO Split all chains on top of click and fix the lint error
    cy.get('#username').click();

    cy.get('#username').type(Cypress.env('username'));

    cy.get('#password').click();

    cy.get('#password').type(Cypress.env('password'));

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

Cypress.Commands.add(`executeCommandStreamByName`, (name: string) => {
    const cliCommand = `node ../../dist/apps/coscrad-cli/main.js execute-command-stream --name=${name}`;

    cy.exec(cliCommand).then((_result) => {
        if (cliCommand.includes(`FOOBARBAZ`)) {
            /* eslint-disable-next-line */
            debugger;
        }
    });
});

Cypress.Commands.add(
    `seedDataWithCommand`,
    (
        type: string,
        payloadOverrides: Record<string, unknown>,
        metaOverrides: Record<string, unknown> = {}
    ) => {
        const serializedPayloadOverrides = JSON.stringify(payloadOverrides).replace(/"/g, `\\"`);

        const serializedMetaOverrides = JSON.stringify(metaOverrides).replace(/"/g, `\\"`);

        // "{\\"foo\\": 5}"
        const command = `node ../../dist/apps/coscrad-cli/main.js seed-test-data-with-command --type=${type} --payload-overrides="${serializedPayloadOverrides}" --meta-overrides="${serializedMetaOverrides}"`;

        cy.exec(command).then((_result) => {
            if (command.includes(`FOOBARBAZ`))
                /* eslint-disable-next-line */
                debugger;
        });
    }
);

Cypress.Commands.add(`seedDatabase`, (collectionName: string, documents: unknown) => {
    const serializedDocuments = JSON.stringify(documents);

    const command = `node ../../dist/apps/coscrad-cli/main.js seed-database --collectionName=${collectionName} --docs="${serializedDocuments.replace(
        /"/g,
        `\\"`
    )}"`;

    cy.exec(command);
});

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
        cy.getByDataAttribute(`open-connected-resources-panel-button`).click();
        return;
    }

    throw new Error(`Failed to open panel of unknown type: ${panelType}`);
});

Cypress.Commands.add(`filterTable`, (searchScope: string, searchText: string) => {
    cy.getByDataAttribute('select_index_search_scope').click();

    cy.getByDataAttribute('select_index_search_scope').get(`[data-value="${searchScope}"]`).click();

    /**
     * cy.type(...) requires a non-empty string, but we want to accommodate
     * leaving the search field empty in this abstraction.
     */
    if (searchText?.length > 0) {
        cy.getByDataAttribute(`index_search_bar`).click();

        cy.getByDataAttribute(`index_search_bar`).type(searchText);
    }
});
