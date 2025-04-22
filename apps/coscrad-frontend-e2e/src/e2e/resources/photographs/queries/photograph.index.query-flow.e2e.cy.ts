import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import {
    buildDummyAggregateCompositeIdentifier,
    buildDummyUuid,
} from '../../../../support/utilities';
import { seedDummyMediaItem } from '../../../shared/seed-dummy-media-item.cy';

const ID_OFFSET = 80;

const dummyPhotographTitle = 'Photograph of historic pithouse';

const dummyPhotographer = 'Jennifer Stump';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.photograph,
    9
);

const { id: photographId } = aggregateCompositeIdentifier;

const validPhotographIndexRoute = `/Resources/Photographs/`;

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    4
);

describe('Photograph index query flow', () => {
    const seedDummyPhotograph = ({
        id,
        title,
        languageCodeForTitle,
        mediaItemId,
        photographer,
        heightPx,
        widthPx,
    }: {
        id: string;
        title: string;
        languageCodeForTitle: LanguageCode;
        mediaItemId: string;
        photographer: string;
        heightPx: number;
        widthPx: number;
    }) => {
        const aggregateCompositeIdentifier = {
            type: AggregateType.photograph,
            id,
        };

        cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
            aggregateCompositeIdentifier,
            title,
            languageCodeForTitle,
            mediaItemId,
            photographer,
            heightPx,
            widthPx,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    };

    const seedManyPhotographsInLanguageWithMediaItems = (
        numberToBuild: number,
        offSet: number,
        mediaItemOffset: number,
        languageCode: LanguageCode
    ) => {
        new Array(numberToBuild).fill('').forEach((_, index) => {
            const mediaItemIndex = mediaItemOffset + offSet + index;

            const mediaItemCompositeIdentifier = buildDummyUuid(mediaItemIndex);

            seedDummyMediaItem({
                id: mediaItemCompositeIdentifier,
                title: `Title of Media Item: ${index + offSet}`,
                mimeType: MIMEType.jpg,
            });

            seedDummyPhotograph({
                id: buildDummyUuid(offSet + index),
                title: `Title of Photograph: ${index + offSet}`,
                languageCodeForTitle: languageCode,
                mediaItemId: mediaItemCompositeIdentifier,
                photographer: dummyPhotographer,
                heightPx: 800,
                widthPx: 200,
            });
        });
    };

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(600);

        seedDummyMediaItem({
            id: mediaItemCompositeIdentifier.id,
            title: `Tawt'a k̲'iidagas Giiahlɢ̲alang`,
            mimeType: MIMEType.jpg,
        });

        cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
            aggregateCompositeIdentifier,
            title: dummyPhotographTitle,
            languageCodeForTitle: LanguageCode.English,
            mediaItemId: mediaItemCompositeIdentifier.id,
            photographer: dummyPhotographer,
            heightPx: 800,
            widthPx: 200,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    });

    describe(`the resource types page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for photographs', () => {
            cy.contains('Photographs');
        });

        it('should have a link to the Photographs', () => {
            cy.contains('Photographs').click();

            cy.contains('Photographs');

            cy.location('pathname').should('contain', 'Resources/Photographs');
        });
    });

    describe(`the photograph index page`, () => {
        beforeEach(() => {
            cy.visit(validPhotographIndexRoute);
        });

        it(`should display the label "Photographs"`, () => {
            cy.contains('Photographs');
        });

        it('should display the title and photographer for photograph 2', () => {
            cy.contains(dummyPhotographTitle);

            cy.contains(dummyPhotographer);
        });

        it(`should have a link to the detail view for this photograph`, () => {
            cy.getByDataAttribute(`${photographId}`).click();

            cy.contains(dummyPhotographTitle);

            cy.location('pathname').should('contain', `/Resources/Photographs/${photographId}`);
        });

        describe(`the search filter`, () => {
            const mediaItemForFilterTestCompositeIdentifier =
                buildDummyAggregateCompositeIdentifier(AggregateType.mediaItem, 17);

            const photographForFilterTestCompositeIdentifier =
                buildDummyAggregateCompositeIdentifier(AggregateType.photograph, 23);

            const photoTitleWithQDash = 'Q-Photo Haida';

            const haidaPhotoTitleToFind = 'Q-';

            const searchScopes = [`allProperties`, `name`];

            before(() => {
                cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
                    aggregateCompositeIdentifier: mediaItemForFilterTestCompositeIdentifier,
                    title: `Sg_iidllg_uu`,
                    mimeType: 'image/jpeg',
                    // Override default value to "remove" property from fsa for image media item
                    lengthMilliseconds: null,
                });

                seedDummyMediaItem({
                    id: mediaItemForFilterTestCompositeIdentifier.id,
                    title: `Sg_iidllg_uu`,
                    mimeType: MIMEType.jpg,
                });

                cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
                    aggregateCompositeIdentifier: photographForFilterTestCompositeIdentifier,
                    title: photoTitleWithQDash,
                    languageCodeForTitle: LanguageCode.Haida,
                    mediaItemId: mediaItemForFilterTestCompositeIdentifier.id,
                    photographer: dummyPhotographer,
                    heightPx: 800,
                    widthPx: 200,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: photographForFilterTestCompositeIdentifier,
                });

                const NUMBER_OF_ENGLISH_PHOTOS = 10;

                const NUMBER_OF_HAIDA_PHOTOS = 15;

                const MEDIA_ITEM_OFFSET = NUMBER_OF_ENGLISH_PHOTOS + NUMBER_OF_HAIDA_PHOTOS;

                seedManyPhotographsInLanguageWithMediaItems(
                    NUMBER_OF_ENGLISH_PHOTOS,
                    ID_OFFSET,
                    MEDIA_ITEM_OFFSET,
                    LanguageCode.English
                );

                seedManyPhotographsInLanguageWithMediaItems(
                    NUMBER_OF_HAIDA_PHOTOS,
                    ID_OFFSET + NUMBER_OF_ENGLISH_PHOTOS,
                    MEDIA_ITEM_OFFSET + NUMBER_OF_ENGLISH_PHOTOS,
                    LanguageCode.Haida
                );
            });

            searchScopes.forEach((searchScope) => {
                describe(`when the search scope is: ${searchScope}`, () => {
                    beforeEach(() => {
                        cy.visit('/Resources/Photographs');

                        cy.getByDataAttribute('select_index_search_scope').click();

                        cy.get(`[data-value="${searchScope}"]`).click();
                    });

                    describe(`when the filter should return 1 result (based on default language Photograph title)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = haidaPhotoTitleToFind;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute('index_search_bar').type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(photoTitleWithQDash);

                            cy.contains(dummyPhotographTitle).should('not.exist');
                        });
                    });

                    describe(`when the filter should return no results`, () => {
                        it(`should show no results`, () => {
                            const searchTerms = `BBQ Chicken`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummyPhotographTitle).should(`not.exist`);

                            cy.getByDataAttribute(`not-found`);
                        });
                    });
                });
            });
        });
    });
});
