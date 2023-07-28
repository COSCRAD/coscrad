import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

const termCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 1);

const { id: termId } = termCompositeIdentifier;

const formattedTermCompositeIdentifier = `term/${termId}`;

describe('IdInfoIcon', () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(1);

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });
    });

    beforeEach(() => {
        cy.visit(`/Resources/Terms/${termId}`);

        cy.get(`[aria-label="Click to Copy ID ${termId}"]`).as('copyButton');
    });

    it('Should display the id icon for the TermDetailFullViewPresenter', () => {
        cy.get('@copyButton').should('be.visible');
    });

    it('Should show the copy modal when clicked', () => {
        cy.get('@copyButton').click();

        cy.getByDataAttribute('copy-id-dialog').should('be.visible');
    });

    it('Should copy the resource ID when the button is clicked', () => {
        cy.grantPermissions('clipboard');

        cy.get('@copyButton').click();

        cy.contains('Copy Id', { matchCase: false }).click();

        cy.assertValueCopiedToClipboard(termId);
    });

    it('Should copy the resource composite identifier when the button is clicked', () => {
        cy.grantPermissions('clipboard');

        cy.get('@copyButton').click();

        cy.contains('Copy Composite Id', { matchCase: false }).click();

        cy.assertValueCopiedToClipboard(formattedTermCompositeIdentifier);
    });
});
