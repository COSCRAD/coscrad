import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const compositeIdentifierForDigitalTextWithUntranslatedContent =
    buildDummyAggregateCompositeIdentifier(AggregateType.digitalText, 1);

const { id: digitalTextId } = compositeIdentifierForDigitalTextWithUntranslatedContent;

const buildDetailRoute = (digitalTextId: string) => `/Resources/DigitalTexts/${digitalTextId}`;

const existingPageIdentifier = '22';

const originalLanguageForContent = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'This is what the page says in English';

describe(`digital text detail- admin- translate page content`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(100);

        cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithUntranslatedContent,
        });

        cy.seedDataWithCommand(`PUBLISH_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithUntranslatedContent,
        });

        cy.seedDataWithCommand(`ADD_PAGE_TO_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithUntranslatedContent,
            identifier: existingPageIdentifier,
        });

        cy.seedDataWithCommand(`ADD_CONTENT_TO_DIGITAL_TEXT_PAGE`, {
            aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithUntranslatedContent,
            pageIdentifier: existingPageIdentifier,
            languageCode: originalLanguageForContent,
            // the original text is not important for this test
        });

        cy.seedDataWithCommand(`TRANSLATE_DIGITAL_TEXT_PAGE_CONTENT`, {
            aggregateCompositeIdentifier: compositeIdentifierForDigitalTextWithUntranslatedContent,
            pageIdentifier: existingPageIdentifier,
            translation: translationText,
            languageCode: translationLanguageCode,
        });
    });

    beforeEach(() => {
        cy.visit('/');

        cy.login();

        cy.navigateToResourceIndex(ResourceType.digitalText);

        cy.get(`[href="${buildDetailRoute(digitalTextId)}"]`).click();
    });

    describe(`when targetting a page with content, but no translation`, () => {
        it(`should expose translation functionality`, () => {
            cy.getByDataAttribute(`text:translate-digital-text-page-content`)
                .as('form-field')
                .click();

            cy.get('@form-field').type(translationText);

            cy.getByDataAttribute('select:language').as('language-select').click();

            cy.get('@language-select').get(`[data-value="${translationLanguageCode}"]`).click();

            cy.contains('translate', { matchCase: false }).click();

            cy.contains(translationText);
        });
    });
});
