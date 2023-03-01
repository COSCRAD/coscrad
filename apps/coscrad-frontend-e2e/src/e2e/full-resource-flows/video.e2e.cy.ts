describe(`Video + transcription flow`, () => {
    beforeEach(() => {
        cy.visit('/');

        cy.login();
    });

    describe(`the resource menu`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for videos', () => {
            cy.contains('videos');
        });

        it(`should have a link to the videos`, () => {
            cy.contains('videos').click();

            cy.contains('Videos');

            cy.location('pathname').should('contain', `Resources/Videos`);
        });
    });

    describe(`the index view`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Videos`);
        });

        it(`should have a create video button`, () => {
            cy.contains(`Create Video`);
        });
    });
});
