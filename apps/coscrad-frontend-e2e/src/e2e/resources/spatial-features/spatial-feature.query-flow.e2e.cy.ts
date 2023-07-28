import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

describe(`Spatial Feature index-to-detail flow`, () => {
    const dummySequentialIds = [100, 101, 102, 103, 104];

    const buildPointName = (id: number) => `Name of Point with ID: ${id}`;

    const points: [number, number][] = [
        [54.034404852745006, -132.17563335558532],
        [53.26710566708586, -131.99142447847115],
        [51.93152097800416, -123.14042112774867],
        [51.935065638350636, -122.50936316168337],
        [52.12579975880678, -123.68132823530952],
    ];

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(105);

        dummySequentialIds.forEach((id, index) => {
            const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
                AggregateType.spatialFeature,
                id
            );

            const [lattitude, longitude] = points[index];

            cy.seedDataWithCommand(`CREATE_POINT`, {
                aggregateCompositeIdentifier,
                name: buildPointName(id),
                lattitude,
                longitude,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier,
            });
        });
    });

    // Note: Leaflet displays Polygons and Lines in a single SVG that is obscured to Cypress
    const idsForPointFeatures = ['100', '101', '102', '103', '104'];

    describe(`the resource menu`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for spatial features', () => {
            // TODO: we should have a human readable resource name and modify this test to look for that.
            cy.contains('Spatial Features');
        });

        it('should have a link to the spatial features', () => {
            cy.get('[data-cy="resourceInfos-stack"]')
                .find('a[href*="Resources/Map"]')
                .should('exist');
        });
    });

    describe(`the spatial feature index page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Map`);
        });

        it('should load the map container', () => {
            cy.get('[data-cy="Map Container"]').should('exist');
        });

        /**
         * TODO [https://www.pivotaltracker.com/story/show/184932902] We need to test the interactive functions of the map
         */

        it(`should display spatial feature markers`, () => {
            cy.get('.leaflet-marker-icon').should('be.visible');
        });

        it(`should be able to open a spatial feature marker`, () => {
            cy.get('.leaflet-marker-icon').eq(2).click();

            cy.get('.leaflet-container').trigger('click', 'center');
        });

        idsForPointFeatures.forEach((idForPointFeature, index) => {
            it(`should display the text for spatial feature ${idForPointFeature}`, () => {
                cy.get('.leaflet-marker-icon').eq(index).click();

                const pointName = `Name of Point with ID: ${idForPointFeature}`;

                cy.contains(pointName);
            });
        });
    });
});
