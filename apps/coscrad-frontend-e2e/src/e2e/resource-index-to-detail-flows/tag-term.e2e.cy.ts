describe(`tagging a note`, () => {
    const termBaseRoute = `/Resources/Terms/`;

    const termId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110003`;

    const tagId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110004';

    const tagResourceLabel = `Tag Resource or Note`;

    describe(`when tagging a term`, () => {
        beforeEach(() => {
            cy.visit(`${termBaseRoute}${termId}`);

            cy.login();

            cy.getByDataAttribute('nav-menu-icon').click();

            cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

            cy.getByDataAttribute('term').click();

            cy.get(`[data-testid="${termId}"] > :nth-child(1)`).click();
        });

        describe(`when the selected tag has not yet been applied to the term`, () => {
            it(`should expose the button`, () => {
                cy.contains(tagResourceLabel);
            });

            describe(`when the form is incomplete`, () => {
                it(`should prevent submission`, () => {
                    cy.contains(tagResourceLabel).click();

                    // Note that there is only one field (a select) which we are intentionally leaving blank
                    cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                });
            });

            describe(`when the form is complete`, () => {
                it(`should succeed`, () => {
                    cy.contains(tagResourceLabel).click();

                    cy.get('.MuiSelect-select').click().get(`[data-value="${tagId}"]`).click();

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.visit(`/Tags/${tagId}`);

                    cy.getByDataAttribute(termId);
                });
            });
        });
    });
});
