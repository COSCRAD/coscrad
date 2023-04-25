const termId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001';
const termCompositeIdentifier = `term/${termId}`;

describe('IdInfoIcon', () => {
    beforeEach(() => {
        cy.visit(`/Resources/Terms/${termId}`);

        cy.get(`[aria-label="Click to Copy ID ${termId}"]`).as('copyButton');
    });

    it('Should display the id icon for the TermDetailFullViewPresenter', () => {
        cy.get('@copyButton').should('be.visible');
    });

    it('Should show the copy modal when clicked', () => {
        cy.get('@copyButton').click();

        cy.getByDataAttribute('copy-id-dialog').should('be.visible');
    });

    it('Should copy the resource ID when the button is clicked', () => {
        cy.grantPermissions('clipboard');

        cy.get('@copyButton').click();

        cy.contains('Copy Id', { matchCase: false }).click();

        cy.assertValueCopiedToClipboard(termId);
    });

    it('Should copy the resource composite identifier when the button is clicked', () => {
        cy.grantPermissions('clipboard');

        cy.get('@copyButton').click();

        cy.contains('Copy Composite Id', { matchCase: false }).click();

        cy.assertValueCopiedToClipboard(termCompositeIdentifier);
    });
});
