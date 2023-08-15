import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

describe(`TRANSLATE_LINE_ITEM`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    const baseRoute = `/Resources/Videos/`;

    const commandLabel = 'Translate Line Item';

    const videoCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.video, 1);

    const { id: videoId } = videoCompositeIdentifier;

    const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.mediaItem,
        2
    );

    const detailRoute = `${baseRoute}${videoId}`;

    const participantInitials = 'AP';

    const originalLanguageCode = LanguageCode.Chilcotin;

    const inPointMilliseconds = 100;

    const outPointMilliseconds = 300;

    const lengthMilliseconds = 30000;

    before(() => {
        cy.seedTestUuids(10);

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
            lengthMilliseconds,
            mediaItemId: mediaItemCompositeIdentifier.id,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_TRANSCRIPT`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
        });

        cy.seedDataWithCommand(`ADD_PARTICIPANT_TO_TRANSCRIPT`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
            initials: participantInitials,
        });

        cy.seedDataWithCommand(`ADD_LINE_ITEM_TO_TRANSCRIPT`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
            speakerInitials: participantInitials,
            languageCode: originalLanguageCode,
            inPointMilliseconds,
            outPointMilliseconds,
        });
    });

    describe(`when the user is not logged in`, () => {
        beforeEach(() => {
            cy.visit(detailRoute);
        });

        it(`should not display the command`, () => {
            cy.contains(commandLabel).should('not.exist');
        });
    });

    describe(`when the user is logged in`, () => {
        before(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(AggregateType.video);

            cy.get(`[href="${detailRoute}"]`).click();
        });

        beforeEach(() => {
            cy.contains(commandLabel).click();
        });

        describe(`when the form is complete`, () => {
            it(`should succeed`, () => {
                cy.contains('bogus');
            });
        });
    });
});
