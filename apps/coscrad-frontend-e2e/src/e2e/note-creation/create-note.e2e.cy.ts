import { ResourceType } from '@coscrad/api-interfaces';

/**
 * Note that this test is redundant with `create-note-about-term`. We keep it
 * as a template for a sanity check test that ensures the note creation panel has
 * been wired up for every resource type.
 */
describe.skip(`note creation`, () => {
    const resourceType = ResourceType.term;

    const resourceRoute = `/Resources/Terms/`;

    const dummyResourceId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001';

    describe(`when adding a note for a resource of type: ${resourceType}`, () => {
        const newNoteText = `this is one awesome ${resourceType}`;

        beforeEach(() => {
            cy.visit(resourceRoute);

            cy.login();

            cy.getByDataAttribute('nav-menu-icon').click();

            cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

            cy.getByDataAttribute('term').click();

            cy.get(`a[href="${resourceRoute}${dummyResourceId}"]`).click();

            cy.contains('Create Note').click();
        });

        /**
         * Note that if text is provided and a langauge code is selected, the command
         * will succeed. There's no way to get a 400 due to invalid state for
         * this command.
         */
        describe(`when the form is complete`, () => {
            it(`should succeed`, () => {
                cy.get('#note_text').click().type(newNoteText);

                cy.get('#note_languageCode').click().get('[data-value="clc"').click();

                cy.getByDataAttribute('submit-dynamic-form').click();

                cy.getByDataAttribute('loading').should('not.exist');

                cy.getByDataAttribute('submit-dynamic-form').should('not.exist');

                cy.contains(newNoteText);
            });
        });

        describe(`when the form is incomplete`, () => {
            describe(`when the language code is not specified`, () => {
                it(`should not allow submission`, () => {
                    cy.get('#note_text').click().type(newNoteText);

                    cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                });
            });

            describe(`when the text is not specified`, () => {
                it(`should not allow submission`, () => {
                    cy.get('#note_languageCode').click().get('[data-value="clc"').click();

                    cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                });
            });
        });
    });
});
