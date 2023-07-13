import { AggregateType } from '@coscrad/api-interfaces';

describe(`Term index-to-detail flow`, () => {
    const textForTerm = 'She is singing (lang)';

    const termId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513`;

    describe(`the resource menu`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for terms', () => {
            cy.contains('terms');
        });

        it('should have a link to the terms', () => {
            cy.contains('Terms').click();

            cy.contains('Terms');

            cy.location('pathname').should('contain', 'Resources/Terms');
        });
    });

    describe(`the term index page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Terms`);
        });

        it('should display the text for term 513', () => {
            cy.contains(textForTerm);
        });

        it('should have a link to the detail view for term 13', () => {
            cy.contains(textForTerm);

            cy.get(`[href="/Resources/Terms/${termId}"]`).click();

            cy.contains(textForTerm);

            cy.location('pathname').should('contain', `/Resources/Terms/${termId}`);
        });
    });

    describe(`the term detail page`, () => {
        const idForTermToView = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

        describe('when there are notes for the term (2)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermToView}`);
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
            const termWithoutNotes = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513`;

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${termWithoutNotes}`);
            });

            it('should display the no notes message', () => {
                cy.contains(textForTerm);

                cy.contains('Notes for');

                cy.contains('Connected Resources');

                cy.contains('No Notes Found');
            });
        });

        describe('when there are connections for the term (2)', () => {
            const idForTermWithConnections = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

            const connectedVideoId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110223';

            const connectedVocabularyListId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

            const connectedPlaylistId = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110501`;

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermWithConnections}`);

                cy.getByDataAttribute('loading').should('not.exist');

                cy.contains('Notes for');

                cy.contains('Connected Resources');
            });

            it('should display the connected playlist', () => {
                cy.getAggregateDetailView(AggregateType.playlist, connectedPlaylistId);
            });

            it('should display the connected media item', () => {
                cy.getAggregateDetailView(
                    AggregateType.mediaItem,
                    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001'
                );
                // cy.contains('episode title (in language) (Metal Mondays episode 1)');
            });

            it('should display the connected vocabulary list', () => {
                cy.getAggregateDetailView(AggregateType.vocabularyList, connectedVocabularyListId);
            });

            it.skip('should display exactly 3 connected resources', () => {
                // we should have a test here.
            });
        });

        describe('when there are no connections for the term (13)', () => {
            const idForTermWithoutConnections = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513`;

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermWithoutConnections}`);
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
