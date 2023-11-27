import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.digitalText,
    1
);

const targetPageIdentifier = 'A.1';

const pageIdentifiers = ['I', 'II', 'III', 'IV', targetPageIdentifier].concat(
    ...Array(5)
        .fill('')
        .map((_, index) => (index + 1).toString())
);

const buildDetailRoute = (digitalTextId: string) => `/Resources/DigitalTexts/${digitalTextId}`;

describe(`digital text- admin- add note`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(100);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier,
        });

        pageIdentifiers.forEach((identifier, index) => {
            cy.seedDataWithCommand(`ADD_PAGE_TO_DIGITAL_TEXT`, {
                aggregateCompositeIdentifier,
                identifier,
            });

            if (index % 2 === 0) {
                cy.seedDataWithCommand(`ADD_CONTENT_TO_DIGITAL_TEXT_PAGE`, {
                    aggregateCompositeIdentifier,
                    pageIdentifier: identifier,
                    text: `contet for page: ${identifier}`,
                    languageCode: LanguageCode.English,
                });
            }
        });
    });

    describe(`when adding a note with page range context`, () => {
        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.digitalText);

            cy.get(`[href="${buildDetailRoute(aggregateCompositeIdentifier.id)}"]`).click();
        });
        describe(`when a single page is selected`, () => {
            const noteText = 'This is the most interesting part of the book!';

            const languageCodeForNote = LanguageCode.English;

            it(`should create a note with the page range context containing one page identifier`, () => {
                const indexOfTarget = pageIdentifiers.indexOf(targetPageIdentifier);

                Array(indexOfTarget)
                    .fill(null)
                    .forEach((_) => {
                        cy.contains('NEXT', { matchCase: false }).click();
                    });

                // Check that the correct page is selected- we will need to find a different strategy soon
                cy.contains(`**${targetPageIdentifier}`);

                cy.getByDataAttribute('text:create-note').as('text-field').click();

                cy.get('@text-field').type(noteText);

                cy.getByDataAttribute('select:language').as('language-select').click();

                cy.get('@language-select').get(`[data-value="${languageCodeForNote}"]`).click();

                cy.contains('ADD NOTE', { matchCase: false }).click();

                cy.acknowledgeCommandResult();

                cy.openPanel('notes');

                // TODO make sure this isn't just floating around the form still
                cy.contains(noteText);
            });
        });
    });
});
