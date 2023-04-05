describe(`Video + transcription flow`, () => {
    describe(`the resource menu`, () => {
        it('should have an entry for videos', () => {
            cy.visit(`/Resources`);

            cy.contains('videos');
        });

        it(`should have a link to the videos`, () => {
            cy.visit(`/Resources`);
            cy.contains('videos').click();

            cy.contains('videos');

            cy.location('pathname').should('contain', `Resources/Videos`);
        });
    });

    describe(`the index view`, () => {
        it.only(`should have a create video button`, () => {
            cy.visit(`/`);
            cy.login();
            cy.contains('Log In').click();

            cy.get('[href="/Resources"]').click();

            cy.get('[data-testid="RESOURCE_CARD__videos"]').click();

            cy.contains('Create Video');
        });
    });
});
