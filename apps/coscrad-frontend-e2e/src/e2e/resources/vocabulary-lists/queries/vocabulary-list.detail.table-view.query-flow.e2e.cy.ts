import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.vocabularyList,
    1
);

const buildRoute = (id: string) => `/Resources/VocabularyLists/${id}`;

const validVocabularyListDetailRoute = buildRoute(aggregateCompositeIdentifier.id);

describe(`the vocabulary list detail page "table view"`, () => {
    describe(`when the list exists`, () => {
        // before(() => {
        //     cy.clearDatabase();

        //     cy.seedTestUuids(200);
        // });

        beforeEach(() => {
            cy.visit(validVocabularyListDetailRoute);

            cy.get('[value="Table"]').click();
        });

        it(`should display the entries using a table`, () => {
            cy.getByDataAttribute(`carousel`).should('not.exist');

            cy.getByDataAttribute(`tableview`).should('exist');
        });
    });
});
