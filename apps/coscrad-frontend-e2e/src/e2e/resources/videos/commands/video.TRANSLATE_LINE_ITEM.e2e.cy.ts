import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const commandLabel = 'Translate Line Item';

const videoCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.video, 1);

const { id: videoId } = videoCompositeIdentifier;

const videoDetailRoute = `Resources/Videos/${videoId}`;

describe(`video: TRANSLATE_LINE_ITEM`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(5);
    });

    describe(`when the user is logged in`, () => {
        beforeEach(() => {
            cy.login();

            cy.visit(videoDetailRoute);
        });

        describe(`it should expose the command button`, () => {
            cy.contains(commandLabel);
        });
    });
});
