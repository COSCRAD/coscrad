describe('Dynamic Route Configuration', () => {
    describe('when the route does not exist', () => {
        beforeEach(() => {
            cy.visit('/scooby-dizzle');
        });

        it('should render an error message', () => {
            cy.get('[data-testid="notFound"]');
        });
    });

    describe('the route for the resource directory', () => {
        beforeEach(() => {
            cy.overwriteConfig({
                listenLive: undefined,
            });
        });

        it.only('should work', () => {
            cy.get('bogus');
        });
    });
});
