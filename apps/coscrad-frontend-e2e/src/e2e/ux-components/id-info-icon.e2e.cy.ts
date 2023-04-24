const termId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001';
const compositeId = `term/${termId}`;

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
        cy.wrap(
            Cypress.automation('remote:debugger:protocol', {
                command: 'Browser.grantPermissions',
                params: {
                    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
                    origin: window.location.origin,
                },
            })
        );

        cy.window()
            .its('navigator.permissions')
            .then((permissions) => permissions.query({ name: 'clipboard-read' }))
            .its('state')
            .should('equal', 'granted');

        cy.get(`[aria-label="Click to Copy ID ${termId}"]`).click();

        cy.get('.MuiDialogContentText-root > :nth-child(1)').click();

        cy.window()
            .its('navigator.clipboard')
            .then((clip) => clip.readText())
            .should('equal', termId);

        cy.get('.MuiDialogContentText-root > :nth-child(2)').click();

        cy.window()
            .its('navigator.clipboard')
            .then((clip) => clip.readText())
            .should('equal', compositeId);
    });
});
