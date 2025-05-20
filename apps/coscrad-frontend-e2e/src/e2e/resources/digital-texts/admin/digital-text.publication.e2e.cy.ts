import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const unpublishedDigitalTextCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.digitalText,
    1
);

const buildDetailRoute = (digitalTextId: string) => `/Resources/DigitalTexts/${digitalTextId}`;

describe(`Digital Text publication`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(100);

        cy.executeCommandStreamByName('users:create-admin');
    });

    describe(`when the digital text is not already published`, () => {
        before(() => {
            cy.seedDataWithCommand('CREATE_DIGITAL_TEXT', {
                aggregateCompositeIdentifier: unpublishedDigitalTextCompositeIdentifier,
            });
        });

        // TODO Should we move this to the detail query flow test?
        describe(`when the user is not authenticated`, () => {
            beforeEach(() => {
                cy.visit(buildDetailRoute(unpublishedDigitalTextCompositeIdentifier.id));
            });

            it(`should display "not found"`, () => {
                cy.getByDataAttribute('not-found');
            });
        });

        describe(`when the user is authenticated`, () => {
            before(() => {
                cy.visit('/');

                cy.login();

                cy.navigateToResourceIndex(ResourceType.digitalText);

                cy.get(
                    `[href="${buildDetailRoute(unpublishedDigitalTextCompositeIdentifier.id)}"]`
                ).click();
            });

            it(`should allow the uesr to publish the digital text`, () => {
                cy.getByDataAttribute('action:publish').click();

                // TODO this one fails because we haven't disabled the dynamic command panel for digital texts
                // cy.acknowledgeCommandResult();

                cy.getByDataAttribute(`command-ack-button`);
            });
        });
    });

    describe(`when the digital text is published`, () => {
        const publishedDigitalTextCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
            AggregateType.digitalText,
            2
        );

        before(() => {
            cy.seedDataWithCommand('CREATE_DIGITAL_TEXT', {
                aggregateCompositeIdentifier: publishedDigitalTextCompositeIdentifier,
            });

            cy.seedDataWithCommand('PUBLISH_RESOURCE', {
                aggregateCompositeIdentifier: publishedDigitalTextCompositeIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit(buildDetailRoute(publishedDigitalTextCompositeIdentifier.id));
        });

        /**
         * TODO Currently, we feature flag out digital texts. Once we expose these
         * to the user, we need to opt back into this test case. It is failing
         * because we are not currently notifying the client of updates
         * to the query databse.
         */
        it.skip(`should display that the digital text is Published`, () => {
            cy.navigateToResourceIndex(ResourceType.digitalText);

            cy.get(
                `[href="${buildDetailRoute(publishedDigitalTextCompositeIdentifier.id)}"]`
            ).click();
        });
    });

    // Note that we test visibility due to publication status in the query tests
});
