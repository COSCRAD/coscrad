describe(`term detail flow`, () => {
    describe(`connect resources with note`, () => {
        const createConnectionCommandLabel = `Create Connection with Note`;

        const newNoteText = 'This is an interesting note.';

        beforeEach(() => {
            cy.visit(`Resoruces/Terms`);
        });

        describe(`when the user is logged-in as COSCRAD admin`, () => {
            beforeEach(() => {
                cy.login();

                cy.getByDataAttribute('nav-menu-icon').click();

                cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

                cy.getByDataAttribute('term').click();

                cy.get(
                    '[data-testid="9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002"] > :nth-child(1)'
                ).click();
            });

            it(`should be avilable`, () => {
                cy.contains(createConnectionCommandLabel);
            });

            describe(`when the form is incomplete`, () => {
                beforeEach(() => {
                    cy.contains(createConnectionCommandLabel).click();

                    cy.getByDataAttribute('submit-dynamic-form').as('submit');
                });

                describe(`when the text is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                        cy.getByDataAttribute('global_resourceType_select')
                            .click()
                            .get('[data-value="video"]')
                            .click();

                        cy.getByDataAttribute('global_resourceId_select')
                            .click()
                            .get('[data-value="9b1deb4d-3b7d-4bad-9bdd-2b0d7b110223"]')
                            .click();

                        cy.get('@submit').should('be.disabled');
                    });
                });

                describe(`when the language code is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_text').click().type(newNoteText);

                        cy.getByDataAttribute('global_resourceType_select')
                            .click()
                            .get('[data-value="video"]')
                            .click();

                        cy.getByDataAttribute('global_resourceId_select')
                            .click()
                            .get('[data-value="9b1deb4d-3b7d-4bad-9bdd-2b0d7b110223"]')
                            .click();

                        cy.get('@submit').should('be.disabled');
                    });
                });

                describe(`when the to resource type is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_text').click().type(newNoteText);

                        cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                        cy.get('@submit').should('be.disabled');
                    });
                });

                describe(`when the to resource ID is omitted`, () => {
                    it(`should disable submission`, () => {
                        cy.get('#note_text').click().type(newNoteText);

                        cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                        cy.getByDataAttribute('global_resourceType_select')
                            .click()
                            .get('[data-value="video"]')
                            .click();

                        cy.get('@submit').should('be.disabled');
                    });
                });
            });

            describe(`when the form is complete`, () => {
                beforeEach(() => {
                    cy.contains(createConnectionCommandLabel).click();

                    cy.get('#note_text').click().type(newNoteText);

                    cy.get('#note_languageCode').click().get('[data-value="clc"]').click();

                    cy.getByDataAttribute('global_resourceType_select')
                        .click()
                        .get('[data-value="video"]')
                        .click();

                    cy.getByDataAttribute('global_resourceId_select')
                        .click()
                        .get('[data-value="9b1deb4d-3b7d-4bad-9bdd-2b0d7b110223"]')
                        .click();
                });

                it(`should be available`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').should('not.be.disabled');
                });

                it.only('should create the new connection', () => {
                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.getByDataAttribute(`9b1deb4d-3b7d-4bad-9bdd-2b0d7b110223`);
                });
            });
        });
    });
});
