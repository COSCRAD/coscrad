// TODO Remove this test- it's just for troubleshooting Cypress inrastructure
describe(`when running a test`, () => {
    it(`should clear the database in-between`, () => {
        cy.clearDatabase()
    });
});
