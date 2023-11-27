import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const compositeIdentifierForDigitalTextWithoutAPageContent = buildDummyAggregateCompositeIdentifier(
    AggregateType.digitalText,
    1
);

const buildDetailRoute = (digitalTextId: string) => `/Resources/DigitalTexts/${digitalTextId}`;

const existingPageIdentifier = 'A.2';

describe(`digital text detail- admin- add content to page`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(100);
    });

    describe(`when the page has no content yet`, () => {
        before(() => {
            cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithoutAPageContent,
            });

            cy.seedDataWithCommand(`PUBLISH_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithoutAPageContent,
            });

            cy.seedDataWithCommand(`ADD_PAGE_TO_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithoutAPageContent,
                identifier: existingPageIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.digitalText);

            cy.get(
                `[href="${buildDetailRoute(
                    compositeIdentifierForDigitalTextWithoutAPageContent.id
                )}"]`
            ).click();
        });

        describe(`when the form is complete`, () => {
            const newTextContent = 'woo hoo';

            it(`should add the content`, () => {
                cy.getByDataAttribute(`text:add-content-to-page:`).as('form-field').click();

                cy.get('@form-field').type(newTextContent);

                cy.contains('add content', { matchCase: false }).click();
            });
        });
    });

    describe(`when the page already has content`, () => {
        const compositeIdentifierForDigitalTextWithAPageWithContent =
            buildDummyAggregateCompositeIdentifier(AggregateType.digitalText, 2);

        before(() => {
            cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithAPageWithContent,
                title: 'text with page with content',
            });

            cy.seedDataWithCommand(`PUBLISH_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithAPageWithContent,
            });

            cy.seedDataWithCommand(`ADD_PAGE_TO_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithAPageWithContent,
                identifier: existingPageIdentifier,
            });

            cy.seedDataWithCommand(`ADD_CONTENT_TO_DIGITAL_TEXT_PAGE`, {
                aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithAPageWithContent,
                pageIdentifier: existingPageIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.digitalText);

            cy.get(
                `[href="${buildDetailRoute(
                    compositeIdentifierForDigitalTextWithAPageWithContent.id
                )}"]`
            ).click();
        });

        it(`should not be editable`, () => {
            cy.getByDataAttribute(`text:add-content-to-page:`).should('not.exist');
        });
    });
});
