import { AggregateType } from '@coscrad/api-interfaces';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

/**
 * TODO: move this to a Cypress Component test
 */
describe('CommaSeparatedList', () => {
    const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.bibliographicCitation,
        1
    );

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(1);

        cy.seedDataWithCommand(`CREATE_BOOK_BIBLIOGRAPHIC_CITATION`, {
            aggregateCompositeIdentifier,
            creators: [
                {
                    name: 'Alana Duvernay',
                    type: BibliographicSubjectCreatorType.author,
                },
                {
                    name: 'James Smith',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    });

    beforeEach(() => {
        cy.visit('/Resources/BibliographicCitations/9b1deb4d-3b7d-4bad-9bdd-2b0d7b100001');
    });

    it('Should display the creators for the BookBibliographicCitation', () => {
        cy.contains('Creators');
    });

    it('Should display a comma separated list of creators', () => {
        cy.get('.MuiGrid-grid-sm-2 > :nth-child(4)').contains(
            'Alana Duvernay (author), James Smith (author)'
        );
    });
});
