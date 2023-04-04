/**
 * TODO: move this to component test in Jest
 */
describe('CommaSeparatedList', () => {
    beforeEach(() => {
        cy.visit('/Resources/BibliographicReferences/9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001');
    });

    it('Should display the creators for the BookBibliographicReference', () => {
        cy.contains('Creators');
    });

    it('Should display a comma separated list of creators', () => {
        cy.get('.MuiGrid-grid-sm-3 > :nth-child(2)').contains(
            'Alana Duvernay (author), James Smith (author)'
        );
    });
});
