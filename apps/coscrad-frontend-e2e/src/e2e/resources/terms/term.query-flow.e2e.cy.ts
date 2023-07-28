import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

describe(`Term index-to-detail flow`, () => {
    const basicTermCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.term,
        513
    );

    const textForTerm = 'She is singing (lang)';

    const { id: basicTermId } = basicTermCompositeIdentifier;

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(999);

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: basicTermCompositeIdentifier,
            text: textForTerm,
            languageCode: LanguageCode.Chilcotin,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: basicTermCompositeIdentifier,
        });
    });

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

        it('should have a link to the detail view for term 513', () => {
            cy.contains(textForTerm);

            cy.get(`[href="/Resources/Terms/${basicTermId}"]`).click();

            cy.contains(textForTerm);

            cy.location('pathname').should('contain', `/Resources/Terms/${basicTermId}`);
        });
    });

    describe(`the term detail page`, () => {
        const compositeIdentifierOfTermToView = buildDummyAggregateCompositeIdentifier(
            AggregateType.term,
            2
        );

        const { id: idForTermToView } = compositeIdentifierOfTermToView;

        const noteText =
            'This first 4 letters of this term form a syllable that indicates this is a plant ';

        before(() => {
            cy.seedDataWithCommand(`CREATE_TERM`, {
                aggregateCompositeIdentifier: compositeIdentifierOfTermToView,
                text: 'I have notes',
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: compositeIdentifierOfTermToView,
            });

            cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
                aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                    AggregateType.note,
                    801
                ),
                resourceCompositeIdentifier: compositeIdentifierOfTermToView,
                text: noteText,
            });
        });

        describe('when there are notes for the term (2)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermToView}`);
            });

            it(`it should display the note text:\n${noteText}`, () => {
                cy.openPanel('notes');

                cy.contains(noteText);
            });
        });

        describe('when there are no notes for the term (13)', () => {
            // Note that we have yet to add a note for this term
            const { id: idOfTermWithoutNotes } = basicTermCompositeIdentifier;

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idOfTermWithoutNotes}`);
            });

            it('should display the no notes message', () => {
                cy.contains(textForTerm);

                cy.openPanel('notes');

                cy.contains('No Notes Found');
            });
        });

        describe('when there are connections for the term (2)', () => {
            const connectedPlayListCompositeId = buildDummyAggregateCompositeIdentifier(
                AggregateType.playlist,
                12
            );

            const { id: connectedPlaylistId } = connectedPlayListCompositeId;

            before(() => {
                cy.seedDataWithCommand(`CREATE_PLAYLIST`, {
                    aggregateCompositeIdentifier: connectedPlayListCompositeId,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: connectedPlayListCompositeId,
                });

                cy.seedDataWithCommand(`CONNECT_RESOURCES_WITH_NOTE`, {
                    aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                        AggregateType.note,
                        402
                    ),
                    toMemberCompositeIdentifier: connectedPlayListCompositeId,
                    fromMemberCompositeIdentifier: basicTermCompositeIdentifier,
                });
            });

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${basicTermId}`);

                cy.getByDataAttribute('loading').should('not.exist');
            });

            it('should display the connected playlist', () => {
                cy.openPanel('connections');

                cy.getAggregateDetailView(AggregateType.playlist, connectedPlaylistId);
            });

            it.skip('should display exactly 2 connected resources', () => {
                // we should have a test here.
            });
        });

        describe('when there are no connections for the term (123)', () => {
            const textForTermWithNoConnections = 'I have no connections';

            const compositeIdForTermWithNoConnections = buildDummyAggregateCompositeIdentifier(
                AggregateType.term,
                123
            );

            const { id: idForTermWithoutConnections } = compositeIdForTermWithNoConnections;

            before(() => {
                cy.seedDataWithCommand(`CREATE_TERM`, {
                    aggregateCompositeIdentifier: compositeIdForTermWithNoConnections,
                    text: textForTermWithNoConnections,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: compositeIdForTermWithNoConnections,
                });
            });

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermWithoutConnections}`);
            });

            it('should display the no connections message', () => {
                cy.contains(textForTermWithNoConnections);

                cy.openPanel('connections');

                cy.contains('No Connections Found');
            });
        });
    });
});
