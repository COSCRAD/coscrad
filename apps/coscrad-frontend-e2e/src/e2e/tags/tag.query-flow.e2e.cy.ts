import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

describe('Tags index-to-detail flow', () => {
    const textForTermAttachedToNote = 'Engl-term-2';

    const termCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 1);

    const tagLabelToFind = 'animals';

    const tagCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.tag, 2);

    const { id: tagIdToFind } = tagCompositeIdentifier;

    const nameOfSpatialFeature = 'Name of Point with ID: 102';

    const spatialFeatureCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.spatialFeature,
        3
    );

    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(10);

        cy.seedDataWithCommand(`CREATE_TAG`, {
            aggregateCompositeIdentifier: tagCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
            text: textForTermAttachedToNote,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });

        cy.seedDataWithCommand(`TAG_RESOURCE_OR_NOTE`, {
            aggregateCompositeIdentifier: tagCompositeIdentifier,
            taggedMemberCompositeIdentifier: termCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_POINT`, {
            aggregateCompositeIdentifier: spatialFeatureCompositeIdentifier,
            name: nameOfSpatialFeature,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: spatialFeatureCompositeIdentifier,
        });

        cy.seedDataWithCommand(`TAG_RESOURCE_OR_NOTE`, {
            aggregateCompositeIdentifier: tagCompositeIdentifier,
            taggedMemberCompositeIdentifier: spatialFeatureCompositeIdentifier,
        });
    });

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
            cy.contains(nameOfSpatialFeature);
        });
    });
});
