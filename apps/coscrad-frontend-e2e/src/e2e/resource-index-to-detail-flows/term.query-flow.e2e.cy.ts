describe(`Term index-to-detail flow`, () => {
    const textForTerm = 'She is singing (lang)';

    describe(`the resource menu`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for terms', () => {
            cy.contains('terms');
        });

        it('should have a link to the terms', () => {
            cy.contains('terms').click();

            cy.contains('Terms');

            cy.location('pathname').should('contain', 'Resources/Terms');
        });
    });

    describe(`the term index page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Terms`);
        });

        it('should display the text for term 13', () => {
            cy.contains(textForTerm);
        });

        it('should have a link to the detail view for term 13', () => {
            cy.contains(textForTerm);

            cy.get('[data-testid="13"] > :nth-child(1) > a').click();

            cy.contains(textForTerm);

            cy.location('pathname').should(
                'contain',
                `/Resources/Terms/9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513`
            );
        });
    });

    describe(`the term detail page`, () => {
        describe('when there are notes for the term (2)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`);
            });
            const allNotes = [
                'This first 4 letters of this term form a syllable that indicates this is a plant ',
                // why are both notes the same? Fix the dummy data.
                'This first 4 letters of this term form a syllable that indicates this is a plant ',
            ];

            allNotes.forEach((noteText) =>
                it(`it should display the note text:\n${noteText}`, () => {
                    cy.contains(noteText);
                })
            );
        });

        describe('when there are no notes for the term (13)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513`);
            });

            it('should display the no notes message', () => {
                cy.contains(textForTerm);

                cy.contains('Notes for');

                cy.contains('Connected Resources');

                cy.contains('No Notes Found');
            });
        });

        describe('when there are connections for the term (2)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`);

                cy.contains('Notes for');

                cy.contains('Connected Resources');
            });

            it('should display the connected song', () => {
                cy.contains('Song title in language (Mary had a little lamb)');
            });

            it('should display the connected media item', () => {
                cy.contains('episode title (in language) (Metal Mondays episode 1)');
            });

            it('should display the connected vocabulary list', () => {
                cy.contains('test VL 2');
            });

            it.skip('should display exactly 3 connected resources', () => {
                // we should have a test here.
            });
        });

        describe('when there are no connections for the term (13)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513`);
            });

            it('should display the no connections message', () => {
                cy.contains(textForTerm);

                cy.contains('Notes for');

                cy.contains('Connected Resources');

                cy.contains('No Connections Found');
            });
        });
    });
});
