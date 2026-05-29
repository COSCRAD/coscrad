import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

describe('Tags index-to-detail flow', () => {
    const textForTerm = 'Engl-term';

    const termCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 1);

    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(10);

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
            text: textForTerm,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });
    });
});
