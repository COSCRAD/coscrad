import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

const audioTitleInLanguage = 'Audio Title';

const basicAudioAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.audioItem,
    1
);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    21
);

const { id: basicAudioId } = basicAudioAggregateCompositeIdentifier;

const audioDetailRoute = `/Resources/AudioItems/${basicAudioId}`;

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock2_370934__karolist__guitar-solo.mp3';

describe('the audio annotation process', () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(50);

        cy.seedDataWithCommand('CREATE_MEDIA_ITEM', {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            url: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_AUDIO_ITEM`, {
            name: audioTitleInLanguage,
            aggregateCompositeIdentifier: basicAudioAggregateCompositeIdentifier,
            mediaItemId: mediaItemCompositeIdentifier.id,
            lengthMilliseconds: 2500,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: basicAudioAggregateCompositeIdentifier,
        });
    });

    beforeEach(() => {
        cy.visit(audioDetailRoute);
    });

    describe(`when the audio has all properties`, () => {
        it(`should renter the audio title`, () => {
            cy.contains(audioTitleInLanguage);
        });
    });
});
