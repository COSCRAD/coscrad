describe(`the video flow`, () => {
    const baseRoute = `/Resources/Videos/`;

    describe(`when the user is not logged in`, () => {
        it(`should not display the create commands`, () => {
            cy.visit(baseRoute);

            // sanity check
            cy.contains('Videos');

            cy.getByDataAttribute('loading').should('not.exist');

            cy.getByDataAttribute('command-selection-area').should('not.exist');
        });
    });

    describe(`when the user is logged in as an admin-user`, () => {
        beforeEach(() => {
            cy.visit(baseRoute);

            cy.login();

            cy.getByDataAttribute('nav-menu-icon').click();

            cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

            cy.getByDataAttribute('video').click();
        });

        it(`should display the commands`, () => {
            cy.contains('Videos');

            cy.getByDataAttribute('loading').should('not.exist');

            cy.getByDataAttribute('command-selection-area');
        });

        describe(`CREATE_VIDEO`, () => {
            it(`should have a button`, () => {
                cy.contains(`Create Video`);
            });

            describe(`when the command is valid`, () => {
                const videoNameText = 'Haida text for video name';

                beforeEach(() => {
                    cy.contains(`Create Video`).click();

                    cy.getByDataAttribute('languageCodeForName_select')
                        .click()
                        .get('[data-value="clc"')
                        .click();

                    cy.getByDataAttribute('text_name').click().type(videoNameText);

                    cy.get('#mui-component-select-mediaItemId')
                        .click()
                        .get('[data-value="9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002"]')
                        .click();

                    cy.get(`input[name=lengthMilliseconds]`).click().type('30000');

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.acknowledgeCommandResult();
                });

                it(`should succeed`, () => {
                    cy.getByDataAttribute('loading').should('not.exist');

                    cy.contains(videoNameText);
                });
            });
        });

        // TODO test that 400 errors are displayed appropriately
        // TODO test that form submission is blocked when the payload type is invalid
    });
});
