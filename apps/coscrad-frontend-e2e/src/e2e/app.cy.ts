describe('coscrad-frontend', () => {
    beforeEach(() => cy.visit('/'));

    it('should display welcome message', () => {
        cy.contains('coscrad', { matchCase: false });
    });
});
