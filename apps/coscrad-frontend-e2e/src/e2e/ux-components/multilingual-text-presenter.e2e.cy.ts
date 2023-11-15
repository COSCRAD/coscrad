import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

const mediaItemName = 'media item for the video';

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    2
);

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

const videoNameInEnglish = `Video 1`;

const videoAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.video,
    1
);

const { id: videoId } = videoAggregateCompositeIdentifier;

const videoDetailRoute = `/Resources/Videos/${videoId}`;

describe('Multilingual Text Presenter', () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(10);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            titleEnglish: mediaItemName,
            mimeType: MIMEType.mp4,
            url: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            aggregateCompositeIdentifier: videoAggregateCompositeIdentifier,
            name: videoNameInEnglish,
            languageCodeForName: LanguageCode.English,
            mediaItemId: mediaItemCompositeIdentifier.id,
            lengthMilliseconds: 720000,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: videoAggregateCompositeIdentifier,
        });
    });

    beforeEach(() => {
        cy.visit(videoDetailRoute);
    });

    it('Should display the English title in the multilingual text presenter', () => {
        cy.getByDataAttribute('multilingual-text-main-text-item').contains(videoNameInEnglish);
    });
});
