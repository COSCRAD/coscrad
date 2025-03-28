import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import {
    buildDummyAggregateCompositeIdentifier,
    buildDummyUuid,
} from '../../../../support/utilities';

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

const contributors = {
    creator: {
        id: buildDummyUuid(112),
        firstName: 'Jamethon',
    },
};

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

    const seedManyPhotographsInLanguage = (
        numberToBuild: number,
        offSet: number,
        languageCode: LanguageCode
    ) => {
        new Array(numberToBuild).fill('').forEach((_, index) =>
            seedDummyPhotograph({
                id: buildDummyUuid(offSet + index),
                title: `Title of Photograph: ${index + offSet}`,
                languageCodeForTitle: languageCode,
                mediaItemId: buildDummyUuid(offSet + 12 + index),
                photographer: dummyPhotographer,
                heightPx: 800,
                widthPx: 200,
            })
        );
    };

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(200);

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            title: `Tawt'a k̲'iidagas Giiahlɢ̲alang`,
            mimeType: 'image/jpeg',
            // Override default value to "remove" property from fsa for image media item
            lengthMilliseconds: null,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_CONTRIBUTOR`, {
            aggregateCompositeIdentifier: {
                type: AggregateType.contributor,
                id: contributors.creator.id,
            },
            shortBio: 'This is a hard-working language champion indeed!',
            firstName: contributors.creator.firstName,
            // we don't bother with the last name
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

        const NUMBER_OF_ENGLISH_PHOTOS = 10;

        const NUMBER_OF_HAIDA_PHOTOS = 15;

        // seedManyPhotographsInLanguage(NUMBER_OF_ENGLISH_PHOTOS, ID_OFFSET, LanguageCode.English);

        // seedManyPhotographsInLanguage(NUMBER_OF_HAIDA_PHOTOS, ID_OFFSET, LanguageCode.Haida);
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

    describe(`the index page`, () => {
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
    });
});
