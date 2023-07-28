import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

describe('Notes index-to-detail flow', () => {
    const noteCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.note, 1);

    const { id: noteId } = noteCompositeIdentifier;

    const termCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 2);

    const textForTermAttachedToNote = 'Engl-term-2';

    const noteText = 'This first 4 letters of this term';

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(5);

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
            text: textForTermAttachedToNote,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
            aggregateCompositeIdentifier: noteCompositeIdentifier,
            resourceCompositeIdentifier: termCompositeIdentifier,
            text: noteText,
        });
    });

    beforeEach(() => {
        cy.visit('/Notes');
    });

    describe('the index page', () => {
        it('should display the label "Notes"', () => {
            cy.contains('Notes');
        });

        describe(`the row for note/${noteId}`, () => {
            it('should exist', () => {
                cy.contains(noteText);
            });
        });

        describe('the link for note 1', () => {
            it('should work', () => {
                // ensure the notes are loaded
                cy.contains('Notes');

                // ensure the connected resource panel is loaded
                cy.contains('Connected Resources');

                cy.get(`[href="/Notes/${noteId}"]`).click();
            });
        });
    });

    // This represents actual failure. We need to fix this.
    describe('the detail page', () => {
        beforeEach(() => {
            cy.visit(`/Notes/${noteId}`);
        });

        it('should contain the text for the note', () => {
            cy.contains(noteText);
        });

        it('should contain the text for the term the note is about', () => {
            // We might want to use a data attribute here instead so we don't assume anything about presentation
            cy.contains(textForTermAttachedToNote);
        });
    });
});
