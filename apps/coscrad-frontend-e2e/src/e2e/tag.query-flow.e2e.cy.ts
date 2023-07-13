describe('Tags index-to-detail flow', () => {
    const textForTermAttachedToNote = 'Engl-term-2';

    const tagLabelToFind = 'animals';

    const tagIdToFind = '2';

    beforeEach(() => {
        cy.visit('/Tags');
    });

    describe('the index page', () => {
        it('should display the label "Tags"', () => {
            cy.contains('Tags');
        });

        describe('the row for note/1', () => {
            it('should exist', () => {
                cy.contains(tagLabelToFind);
            });
        });

        describe('the link for tag 1', () => {
            it('should work', () => {
                // ensure the notes are loaded
                cy.contains('Tags');

                cy.get('[data-testid="tag/1"] > :nth-child(1) > a').click();
            });
        });
    });

    describe('the detail page', () => {
        beforeEach(() => {
            cy.visit(`Tags/${tagIdToFind}`);

            // ensure the connected resource panel is loaded
            cy.contains('Tagged Resources and Notes');
        });

        it('should contain the text for the note', () => {
            cy.contains(tagLabelToFind);
        });

        it('should contain the text for the term that has this tag', () => {
            // We might want to use a data attribute here instead so we don't assume anything about presentation
            cy.contains(textForTermAttachedToNote);
        });

        it('should contain the name of the spatial feature that has this tag', () => {
            cy.contains('Name of Point with ID: 102');
        });
    });
});
