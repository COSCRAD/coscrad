import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const compositeIdentifierForDigitalTextWithoutAPage = buildDummyAggregateCompositeIdentifier(
    AggregateType.digitalText,
    1
);

const compositeIdentifierForDigitalTextThatAlreadyHasAPage = buildDummyAggregateCompositeIdentifier(
    AggregateType.digitalText,
    2
);

const buildDetailRoute = (digitalTextId: string) => `/Resources/DigitalTexts/${digitalTextId}`;

describe(`digital text detail- admin- add page`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(100);
    });

    describe(`when adding a page`, () => {
        before(() => {
            cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithoutAPage,
            });

            cy.seedDataWithCommand(`PUBLISH_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithoutAPage,
            });
        });

        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.digitalText);

            cy.get(
                `[href="${buildDetailRoute(compositeIdentifierForDigitalTextWithoutAPage.id)}"]`
            ).click();
        });

        describe(`before filling out the text field`, () => {
            it(`should prevent submission`, () => {
                cy.contains('add page', { matchCase: false }).should('be.disabled');
            });
        });

        // This is a matter of UX, the back-end validates this independently
        describe(`when the string is solely white-space`, () => {
            it(`should prevent submission`, () => {
                cy.getByDataAttribute('text:add-page-to-digital-text').click();

                cy.getByDataAttribute('text:add-page-to-digital-text').type('   ');

                // TODO Did we remember to strip white-space (back-end too)
                cy.contains('add page', { matchCase: false }).should('be.disabled');
            });
        });

        // This is a matter of UX, the back-end validates this independently

        describe(`when the string contains interior white space`, () => {
            it.only(`should prevent submission`, () => {
                cy.getByDataAttribute('text:add-page-to-digital-text').click();

                cy.getByDataAttribute('text:add-page-to-digital-text').type('x 1 2');

                // TODO Did we remember to strip white-space (back-end too)
                cy.contains('add page', { matchCase: false }).should('be.disabled');
            });
        });

        // TODO Do we need to restrict the range of characters or length (back-end first)

        describe(`when adding a page for the first time`, () => {
            const newPageIdentifier = '11';

            it(`should succeed`, () => {
                cy.getByDataAttribute('text:add-page-to-digital-text').click();

                cy.getByDataAttribute('text:add-page-to-digital-text').type(newPageIdentifier);

                // submit
                cy.contains('add page', { matchCase: false }).click();

                // Do we really need this at this point?
                cy.acknowledgeCommandResult();

                cy.getByDataAttribute(`digital-text.page:${newPageIdentifier}`);
            });
        });

        describe(`when adding a second page`, () => {
            const existingPageIdentifier = 'IV';

            before(() => {
                cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
                    aggregateCompositeIdentifier:
                        compositeIdentifierForDigitalTextThatAlreadyHasAPage,
                    title: `A Robot's Story`,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier:
                        compositeIdentifierForDigitalTextThatAlreadyHasAPage,
                });

                cy.seedDataWithCommand(`ADD_PAGE_TO_DIGITAL_TEXT`, {
                    aggregateCompositeIdentifier:
                        compositeIdentifierForDigitalTextThatAlreadyHasAPage,
                    identifier: existingPageIdentifier,
                });
            });

            describe(`when adding a duplicate page`, () => {
                beforeEach(() => {
                    cy.navigateToResourceIndex(ResourceType.digitalText);

                    cy.get(
                        `[href="${buildDetailRoute(
                            compositeIdentifierForDigitalTextThatAlreadyHasAPage.id
                        )}"]`
                    ).click();
                });

                it(`should prevent submission`, () => {
                    cy.getByDataAttribute('text:add-page-to-digital-text').click();

                    cy.getByDataAttribute('text:add-page-to-digital-text').type(
                        existingPageIdentifier
                    );

                    // submit
                    // TODO Make this a validation error with user notification
                    cy.contains('add page', { matchCase: false }).should('be.disabled');
                });
            });

            describe(`when adding a unique second page`, () => {
                const newPageIdentifier = '1';

                it(`should succeed`, () => {
                    cy.getByDataAttribute('text:add-page-to-digital-text').click();

                    cy.getByDataAttribute('text:add-page-to-digital-text').type(newPageIdentifier);

                    // submit
                    cy.contains('add page', { matchCase: false }).click();

                    // Do we really need this at this point?
                    cy.acknowledgeCommandResult();

                    cy.getByDataAttribute(`digital-text.page:${newPageIdentifier}`);
                });
            });
        });
    });
});
