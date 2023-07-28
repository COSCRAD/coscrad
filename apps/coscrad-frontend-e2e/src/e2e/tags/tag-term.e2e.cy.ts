import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../support/utilities';

describe(`tagging a term`, () => {
    const termBaseRoute = `/Resources/Terms/`;

    const termAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.term,
        2
    );

    const { id: termId } = termAggregateCompositeIdentifier;

    const tagCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.tag, 4);

    const { id: tagId } = tagCompositeIdentifier;

    const tagResourceLabel = `Tag Resource or Note`;

    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(10);

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: termAggregateCompositeIdentifier,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: termAggregateCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_TAG`, {
            aggregateCompositeIdentifier: tagCompositeIdentifier,
        });
    });

    describe(`when tagging a term`, () => {
        beforeEach(() => {
            /**
             * Note that as it stands, clicking the log in button redirects the
             * user away and they must manually find their way back. So we could visit
             * any route (even a not found route).
             */
            cy.visit(`${termBaseRoute}${termId}`);

            cy.login();

            cy.navigateToResourceIndex('term');

            cy.get(`[href="/Resources/Terms/${termId}"]`).click();
        });

        describe(`when the selected tag has not yet been applied to the term`, () => {
            it(`should expose the button`, () => {
                cy.contains(tagResourceLabel);
            });

            describe(`when the form is incomplete`, () => {
                it(`should prevent submission`, () => {
                    cy.contains(tagResourceLabel).click();

                    // Note that there is only one field (a select) which we are intentionally leaving blank
                    cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                });
            });

            describe(`when the form is complete`, () => {
                it(`should succeed`, () => {
                    cy.contains(tagResourceLabel).click();

                    // TODO do not reference MUI here
                    cy.get('.MuiSelect-select').click().get(`[data-value="${tagId}"]`).click();

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.visit(`/Tags/${tagId}`);

                    cy.getAggregateDetailView(AggregateType.term, termId);
                });
            });

            /**
             * TODO Prevent the user from attempting to apply the same tag twice
             * by filtering tags used by this resource from the list.
             */
        });
    });
});
