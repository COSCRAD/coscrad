import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { buildDummyUuid } from '../../../support/utilities';

const dummyDigitalTextTitle = 'Court Procedings of the Supreme Court';

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.digitalText,
    id: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`,
});

const aggregateCompositeIdentifier = buildAggregateCompositeIdentifier('002');

const { id: digitalTextId } = aggregateCompositeIdentifier;

describe('Digital Text Index-to-detail Query Flow', () => {
    const seedDummyDigitalText = ({
        id,
        title,
        languageCodeForTitle,
    }: {
        id: string;
        title: string;
        languageCodeForTitle: LanguageCode;
    }) => {
        const aggregateCompositeIdentifier = {
            type: AggregateType.digitalText,
            id,
        };

        cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier,
            title,
            languageCodeForTitle,
        });

        /**
         * Consider creating many pages and some without pages.
         */
        cy.seedDataWithCommand(`ADD_PAGE_TO_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier,
            identifier: `P1`,
        });

        //   TODO ADD_CONTENT_TO_DIGITAL_TEXT_PAGE

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });
    };

    const seedManyDigitalTextsInLanguage = (numberToBuild: number, languageCode: LanguageCode) => {
        // We save some space for manually executed CLI commands to seed data
        const ID_OFFSET = 50;

        new Array(numberToBuild).fill('').forEach((_, index) =>
            seedDummyDigitalText({
                id: buildDummyUuid(ID_OFFSET + index),
                title: `Title of Digital Text: ${index}`,
                languageCodeForTitle: languageCode,
            })
        );
    };

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(900);

        cy.executeCommandStreamByName('users: create-admin');

        cy.seedDataWithCommand(`CREATE_DIGITAL_TEXT`, {
            aggregateCompositeIdentifier,
            title: dummyDigitalTextTitle,
            languageCodeForTitle: LanguageCode.English,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });

        seedManyDigitalTextsInLanguage(60, LanguageCode.English);

        seedManyDigitalTextsInLanguage(45, LanguageCode.Haida);
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
