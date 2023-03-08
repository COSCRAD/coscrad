describe(`Video + transcription flow`, () => {
    describe(`the resource menu`, () => {
        it('should have an entry for videos', () => {
            cy.visit(`/Resources`);

            cy.contains('videos');

            cy.window().then((store) => {
                Array(100)
                    .fill('here')
                    .forEach((x) => console.log(x));
                console.log({ store });
            });
        });

        it(`should have a link to the videos`, () => {
            cy.visit(`/Resources`);
            cy.contains('videos').click();

            cy.contains('Videos');

            cy.location('pathname').should('contain', `Resources/Videos`);
        });
    });

    describe(`the index view`, () => {
        it(`should have a create video button`, () => {
            cy.visit('/');
            cy.login();
            cy.visit(`/Resources/Videos`);
            cy.contains('Log In').click();

            // .its('auth')
            // .its('hasAuthenticatedUser')
            // .should('be.true');
            // cy.contains(`Create Video`);
        });
    });
});
