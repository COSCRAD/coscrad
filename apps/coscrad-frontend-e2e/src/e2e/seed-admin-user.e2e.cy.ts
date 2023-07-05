describe(`when seeding an admin user`, () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe(`when logged in and viewing terms`, () => {
        it(`should display no errors`, () => {
            cy.clearDatabase();

            cy.executeCommandStream('users:create-admin');

            cy.navigateToResourceIndex('term');

            cy.getByDataAttribute('error').should('not.exist');
        });
    });
});
