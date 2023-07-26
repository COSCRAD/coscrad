describe('Tags index-to-detail flow', () => {
    const textForTermAttachedToNote = 'Engl-term-2';

    const tagLabelToFind = 'animals';

    const tagIdToFind = `9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002`;

    beforeEach(() => {
        cy.visit('/Tags');
    });

    describe('the index page', () => {
        it('should display the label "Tags"', () => {
            cy.contains('Tags');
        });

        describe(`the row for tag/${tagIdToFind}`, () => {
            it('should exist', () => {
                cy.contains(tagLabelToFind);
            });
        });

        describe(`the link for tag/${tagIdToFind}`, () => {
            it('should work', () => {
                // ensure the notes are loaded
                cy.contains('Tags');

                cy.get(`[href="/Tags/${tagIdToFind}"]`).click();
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
