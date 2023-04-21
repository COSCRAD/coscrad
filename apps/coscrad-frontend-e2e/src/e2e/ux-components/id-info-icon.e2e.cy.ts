const termId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001';

describe('IdInfoIcon', () => {
    beforeEach(() => {
        cy.visit(`/Resources/Terms/${termId}`);
    });

    it('Should display the id icon for the TermDetailFullViewPresenter', () => {
        cy.get(`[aria-label="Click to Copy ID ${termId}"]`).should('be.visible');
    });

    it('Should show the copy modal when clicked', () => {
        cy.get(`[aria-label="Click to Copy ID ${termId}"]`).click();

        cy.get('.MuiDialogContent-root').should('be.visible');
    });

    it('Should copy the resource ID when the clipboard button is clicked', () => {
        cy.get(`[aria-label="Click to Copy ID ${termId}"]`).click();

        cy.get('[data-testid="ContentCopyIcon"]').click();

        cy.assertValueCopiedToClipboard(termId);
    });
});
