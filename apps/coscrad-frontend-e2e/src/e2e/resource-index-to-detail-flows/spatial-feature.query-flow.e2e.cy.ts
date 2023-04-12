describe(`Spatial Feature index-to-detail flow`, () => {
    const textForSpatialFeatureMarker = 'Name of Point with ID: 103';

    describe(`the resource menu`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for spatial features', () => {
            // TODO: we should have a human readable resource name and modify this test to look for that.
            cy.contains('spatialFeatures');
        });

        it('should have a link to the spatial features', () => {
            cy.contains('spatialFeatures').click();

            /**
             * We don't have a title for this page since the map is self-evident.
             * This test however should not be tied to the implementation of the Leaflet plugin
             */
            cy.contains('Leaflet');

            cy.location('pathname').should('contain', 'Resources/Map');
        });
    });

    describe(`the spatial feature index page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Map`);
        });

        it('should display a leaflet map', () => {
            // Not sure if this is working - map appears not to move
            cy.get('.leaflet-container').dragMapFromCenter({
                xMoveFactor: 60,
                yMoveFactor: -100,
            });
        });

        it(`should display spatial feature markers`, () => {
            cy.get('.leaflet-marker-icon').should('be.visible');
        });

        it(`should be able to open a spatial feature marker`, () => {
            cy.get('.leaflet-marker-icon').eq(2).click();

            cy.wait(1000);

            cy.get('.leaflet-container').trigger('click', 'center');

            cy.wait(1000);
        });

        it('should display the text for spatial feature 103', () => {
            cy.get('.leaflet-marker-icon').eq(3).click();

            cy.contains(textForSpatialFeatureMarker);
        });
    });
});
