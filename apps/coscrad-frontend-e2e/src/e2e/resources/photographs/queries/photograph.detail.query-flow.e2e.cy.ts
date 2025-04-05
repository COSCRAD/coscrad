import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';
import { seedDummyMediaItem } from '../../../shared/seed-dummy-media-item.cy';

const photographAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.photograph,
    2
);

const photographAggregateCompositeIdentifierNoNotes = buildDummyAggregateCompositeIdentifier(
    AggregateType.photograph,
    3
);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    12
);

const mediaItemCompositeIdentifierNoNotes = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    13
);

const mediaItemCompositeIdentifierNoConnections = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    14
);

const buildRoute = (id: string) => `/Resources/Photographs/${id}`;

const photographTitle = 'My Photo';

const photographTitleNoNotes = 'My Photo without any notes';

const dummyPhotographer = 'Slank Mortimer';

const languageCodeForTitle = LanguageCode.Haida;

const validPhotographDetailRoute = buildRoute(photographAggregateCompositeIdentifier.id);

const noteText = 'This is a note about a photograph';

describe(`the photograph detail page`, () => {
    describe(`when the photograph with the given ID 123 does not exist`, () => {
        beforeEach(() => {
            cy.visit(buildRoute(`123`));
        });

        it(`should display the not found page`, () => {
            cy.getByDataAttribute('not-found');
        });
    });

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(200);

        seedDummyMediaItem({
            id: mediaItemCompositeIdentifier.id,
            title: 'My photo of Masset',
            mimeType: MIMEType.jpg,
        });

        cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
            aggregateCompositeIdentifier: photographAggregateCompositeIdentifier,
            title: photographTitle,
            languageCodeForTitle,
            mediaItemId: mediaItemCompositeIdentifier.id,
            photographer: dummyPhotographer,
            heightPx: 800,
            widthPx: 200,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: photographAggregateCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
            aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                AggregateType.note,
                15
            ),
            resourceCompositeIdentifier: photographAggregateCompositeIdentifier,
            text: noteText,
        });

        seedDummyMediaItem({
            id: mediaItemCompositeIdentifierNoNotes.id,
            title: 'My photo of Skidegate with no notes',
            mimeType: MIMEType.jpg,
        });

        cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
            aggregateCompositeIdentifier: photographAggregateCompositeIdentifierNoNotes,
            title: photographTitleNoNotes,
            languageCodeForTitle,
            mediaItemId: mediaItemCompositeIdentifierNoNotes.id,
            photographer: dummyPhotographer,
            heightPx: 800,
            widthPx: 200,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: photographAggregateCompositeIdentifierNoNotes,
        });
    });

    describe(`when the photograph exists`, () => {
        beforeEach(() => {
            cy.visit(validPhotographDetailRoute);
        });

        it(`should contain the photograph name`, () => {
            cy.contains(photographTitle);

            cy.contains(dummyPhotographer);

            cy.getByDataAttribute('LanguageIcon').first().trigger('mouseover');

            cy.contains("Haida, 'original'");
        });
    });

    describe('when there are notes for the Photograph (2)', () => {
        beforeEach(() => {
            cy.visit(validPhotographDetailRoute);
        });

        it(`should display the note text:\n${noteText}`, () => {
            cy.openPanel('notes');

            cy.contains(noteText);
        });
    });

    describe('when there are no notes for the Photograph (3)', () => {
        beforeEach(() => {
            cy.visit(`/Resources/Photographs/${photographAggregateCompositeIdentifierNoNotes.id}`);
        });

        it(`should display the no notes message`, () => {
            cy.contains(photographTitleNoNotes);

            cy.openPanel('notes');

            cy.contains('No Notes Found');
        });
    });

    describe('when there are connections for the photograph (2)', () => {
        const connectedSpatialFeatureCompositeId = buildDummyAggregateCompositeIdentifier(
            AggregateType.spatialFeature,
            24
        );

        const { id: connectedSpatialFeatureId } = connectedSpatialFeatureCompositeId;

        before(() => {
            cy.seedDataWithCommand(`CREATE_POINT`, {
                aggregateCompositeIdentifier: connectedSpatialFeatureCompositeId,
                lattitude: 130.45,
                longitude: 54.2,
                name: 'connected place',
                description: 'This is a connected place to the photo.',
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: connectedSpatialFeatureCompositeId,
            });

            cy.seedDataWithCommand(`CONNECT_RESOURCES_WITH_NOTE`, {
                aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                    AggregateType.note,
                    32
                ),
                toMemberCompositeIdentifier: connectedSpatialFeatureCompositeId,
                fromMemberCompositeIdentifier: photographAggregateCompositeIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit(validPhotographDetailRoute);

            cy.getByDataAttribute('loading').should('not.exist');
        });

        it('should display the connected spatial feature', () => {
            cy.openPanel('connections');

            cy.getAggregateDetailView(AggregateType.spatialFeature, connectedSpatialFeatureId);
        });
    });

    describe('when there are no connections for the photograph (123)', () => {
        const titleForPhotographWithNoConnections = 'I have no connections';

        const compositeIdForPhotographWithNoConnections = buildDummyAggregateCompositeIdentifier(
            AggregateType.photograph,
            123
        );

        const { id: idForPhotographWithoutConnections } = compositeIdForPhotographWithNoConnections;

        before(() => {
            seedDummyMediaItem({
                id: mediaItemCompositeIdentifierNoConnections.id,
                title: 'My photo of Masset without connections',
                mimeType: MIMEType.jpg,
            });

            cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
                aggregateCompositeIdentifier: compositeIdForPhotographWithNoConnections,
                title: titleForPhotographWithNoConnections,
                mediaItemId: mediaItemCompositeIdentifierNoConnections.id,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: compositeIdForPhotographWithNoConnections,
            });
        });

        beforeEach(() => {
            cy.visit(`/Resources/Photographs/${idForPhotographWithoutConnections}`);
        });

        it('should display the no connections message', () => {
            cy.contains(titleForPhotographWithNoConnections);

            cy.openPanel('connections');

            cy.contains('No Connections Found');
        });
    });
});
