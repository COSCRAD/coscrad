import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.photograph,
    2
);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    12
);

const buildRoute = (id: string) => `/Resources/Photographs/${id}`;

const photographTitle = 'My Photo';

const dummyPhotographer = 'Slank Mortimer';

const languageCodeForTitle = LanguageCode.Haida;

const validPhotographDetailRoute = buildRoute(aggregateCompositeIdentifier.id);

describe(`the photograph detail page`, () => {
    describe(`when the photograph with the given ID 123 does not exist`, () => {
        beforeEach(() => {
            cy.visit(buildRoute(`123`));
        });

        it(`should display the not found page`, () => {
            cy.getByDataAttribute('not-found');
        });
    });

    describe(`when the photograph exists`, () => {
        beforeEach(() => {
            cy.visit(validPhotographDetailRoute);
        });

        describe(`when the photograph exists`, () => {
            before(() => {
                cy.clearDatabase();

                cy.seedTestUuids(200);

                cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
                    aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
                    title: 'My photo of Masset',
                    mimeType: MIMEType.jpg,
                    // Override default value to "remove" property from fsa for image media item
                    lengthMilliseconds: null,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
                });

                cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
                    aggregateCompositeIdentifier,
                    title: photographTitle,
                    languageCodeForTitle,
                    mediaItemId: mediaItemCompositeIdentifier.id,
                    photographer: dummyPhotographer,
                    heightPx: 800,
                    widthPx: 200,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier,
                });
            });

            it(`should contain the photograph name`, () => {
                cy.contains(photographTitle);

                cy.contains(dummyPhotographer);

                cy.getByDataAttribute('LanguageIcon').first().trigger('mouseover');

                cy.contains("Haida, 'original'");
            });
        });
    });
});
