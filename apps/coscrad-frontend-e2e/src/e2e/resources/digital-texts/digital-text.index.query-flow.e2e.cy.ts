import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';

const dummyDigitalTextTitle = 'Court Procedings of the Supreme Court';

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.digitalText,
    id: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`,
});

const aggregateCompositeIdentifier = buildAggregateCompositeIdentifier('002');

const { id: digitalTextId } = aggregateCompositeIdentifier;

describe('Digital Text Index-to-detail Query Flow', () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(10);

        cy.executeCommandStreamByName('users: create-admin');

        cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier,
            title: dummyDigitalTextTitle,
            languageCodeForTitle: LanguageCode.English,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    });

    describe(`the index page`, () => {
        beforeEach(() => {
            cy.visit('/Resources/DigitalTexts');
        });

        it(`should display the label "Digital Texts"`, () => {
            cy.contains('Digital Texts');
        });

        describe(`when there is a digital text`, () => {
            it('should display the title', () => {
                cy.contains(dummyDigitalTextTitle);
            });

            it('should have a link to the detail view for this digital text', () => {
                cy.get(`[href="/Resources/DigitalTexts/${digitalTextId}"]`).click();

                cy.contains(dummyDigitalTextTitle);

                cy.location('pathname').should(
                    'contain',
                    `/Resources/DigitalTexts/${digitalTextId}`
                );
            });
        });
    });
});
