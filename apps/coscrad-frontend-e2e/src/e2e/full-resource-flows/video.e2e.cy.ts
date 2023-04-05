describe(`Video + transcription flow`, () => {
    describe(`the resource menu`, () => {
        it('should have an entry for videos', () => {
            cy.visit(`/Resources`);

            cy.contains('videos');
        });

        it(`should have a link to the videos`, () => {
            cy.visit(`/Resources`);

            cy.get('[href="/Resources/Videos"]');
        });
    });

    describe(`the index view`, () => {
        it(`should have a create video button`, () => {
            cy.visit('/');

            cy.login();

            cy.get('[data-testid="nav-menu-control"]').click();

            cy.get('[href="/Resources"]').click();

            cy.get('[data-testid="RESOURCE_CARD__videos"]').click();

            cy.contains('Create Video').click();

            cy.contains('Haida').click();
        });
    });
});
