describe(`photograph detail view`, () => {
    describe(`note creation`, () => {
        const photographId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

        const createNoteLabel = 'Create Note';

        beforeEach(() => {
            cy.visit(`/Resources/Terms/${photographId}`);
        });

        describe(`when the user is not logged in`, () => {
            it(`should not be available`, () => {
                cy.contains(createNoteLabel).should('not.exist');
            });
        });
        //  TODO Add aditional non-admin test users and test this
        // describe(`when the user is logged-in, but not an admin`, () => {
        //     it(`should not display the panel`, () => {
        //         cy.get('woo hooo hooo not found~ test me!');
        //     });
        // });

        describe(`when the user is logged in as COSCRAD admin`, () => {
            beforeEach(() => {
                cy.login();

                cy.getByDataAttribute('nav-menu-icon').click();

                cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

                cy.getByDataAttribute('photograph').click();

                cy.get(`[data-testid="${photographId}"] > :nth-child(1) > a`).click();
            });

            it(`should be available`, () => {
                cy.contains(createNoteLabel);
            });

            describe(`when the form is incomplete`, () => {
                beforeEach(() => {
                    cy.contains(createNoteLabel).click();
                });

                describe(`when the entire form is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                    });
                });

                describe(`when the text is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.get('.MuiSelect-select').click().get('[data-value="eng"]').click();

                        cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                    });
                });
            });

            describe(`when the form is complete`, () => {
                const newNoteText = 'This is a very interesting note about the nice photograph.';

                beforeEach(() => {
                    cy.contains(createNoteLabel).click();

                    cy.get('#note_text').click().type(newNoteText);

                    cy.get('#note_languageCode').click().get('[data-value="hai"').click();
                });

                it(`should be available`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').should('not.be.disabled');
                });

                it(`should show loading immediately after submitting the command`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.getByDataAttribute('loading');
                });

                it(`should successfully submit the command`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.getByDataAttribute('loading').should('not.exist');

                    cy.contains(newNoteText);
                });

                it(`should succesfully create multiple notes`, () => {
                    const secondNoteText = 'Another note about this amazing photograph.';

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    // Acknowledge success of the first command
                    cy.getByDataAttribute('command-ack-button').click();

                    // open the form to submit a second command
                    cy.contains(createNoteLabel).click();

                    cy.get('#note_text').click().type(secondNoteText);

                    cy.get('#note_languageCode').click().get('[data-value="clc"').click();

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    // wait until the command endpoint responds with an ack
                    cy.getByDataAttribute('loading').should('not.exist');

                    cy.getByDataAttribute('command-ack-button').click();

                    cy.contains(secondNoteText);
                });
            });
        });
    });
});
