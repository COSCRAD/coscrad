describe(`term detail view `, () => {
    describe(`note creation`, () => {
        const termId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

        const createNoteLabel = 'Create Note';

        beforeEach(() => {
            cy.visit(`/Resources/Terms/${termId}`);
        });

        describe(`when the user is not logged in`, () => {
            it(`should not be available`, () => {
                cy.contains(createNoteLabel).should('not.exist');
            });
        });

        describe(`when the user is logged-in, but not an admin`, () => {
            it(`should not display the panel`, () => {
                cy.get('woo hooo hooo not found~ test me!');
            });
        });

        describe.only(`when the user is logged-in as COSCRAD admin`, () => {
            beforeEach(() => {
                cy.login();

                cy.getByDataAttribute('nav-menu-icon').click();

                cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

                cy.getByDataAttribute('term').click();

                cy.get(
                    '[data-testid="9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002"] > :nth-child(1)'
                ).click();
            });

            it(`should be available`, () => {
                cy.contains(createNoteLabel);
            });

            describe(`when the form is not complete`, () => {
                describe(`when the entire is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.getByDataAttribute('submit-new-note').should('be.disabled');
                    });
                });

                describe(`when the language code (select) is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.get('#note_text').click().type('This is an interesting note.');

                        cy.getByDataAttribute('submit-new-note').should('be.disabled');
                    });
                });

                describe(`when the text is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.get('.MuiSelect-select').click().get('[data-value="eng"]').click();

                        cy.getByDataAttribute('submit-new-note').should('be.disabled');
                    });
                });
            });

            describe.only(`when the form is complete`, () => {
                beforeEach(() => {
                    cy.get('#note_text').click().type('This is an interesting note.');

                    cy.get('.MuiSelect-select').click().get('[data-value="eng"]').click();
                });

                it(`should be available`, () => {
                    cy.getByDataAttribute('submit-new-note').should('not.be.disabled');
                });

                it.only(`should submit the command`, () => {
                    cy.getByDataAttribute('submit-new-note').click();

                    cy.getByDataAttribute('loading');
                });
            });
        });
    });
});
