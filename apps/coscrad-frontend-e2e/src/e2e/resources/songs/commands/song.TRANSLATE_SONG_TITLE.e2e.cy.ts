import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const originalLanguageCode = LanguageCode.Haida;

const translationLanguageCode = LanguageCode.English;

const translationText = `English Song Title`;

const buildSongDetailRoute = (id: string) => `/Resources/Songs/${id}`;

const commandLabel = 'Translate Title';

// TODO Opt in to admin e2e tests
describe.skip(`when translating a song's title`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedTestUuids(20);
    });

    beforeEach(() => {
        cy.visit('/');

        cy.login();
    });

    describe(`when there is no translation of the title yet`, () => {
        const compositeIdForSongWithNoTranslation = buildDummyAggregateCompositeIdentifier(
            AggregateType.song,
            1
        );

        before(() => {
            cy.seedDataWithCommand(`CREATE_SONG`, {
                aggregateCompositeIdentifier: compositeIdForSongWithNoTranslation,
                languageCodeForTitle: originalLanguageCode,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: compositeIdForSongWithNoTranslation,
            });
        });

        beforeEach(() => {
            cy.navigateToResourceIndex(ResourceType.song);

            cy.get(
                `[href="${buildSongDetailRoute(compositeIdForSongWithNoTranslation.id)}"]`
            ).click();
        });

        it(`should expose the command button`, () => {
            cy.contains(commandLabel).click();
        });

        describe(`when the form is not complete`, () => {
            beforeEach(() => {
                cy.contains(commandLabel).click();
            });

            describe(`when the form is completely empty`, () => {
                it(`should disable the form`, () => {
                    cy.getCommandFormSubmissionButton().should('be.disabled');
                });
            });

            describe(`when the text box is empty`, () => {
                it(`should disable the form`, () => {
                    cy.getByDataAttribute('languageCode_select')
                        .click()
                        .get(`[data-value="${translationLanguageCode}"`)
                        .click();

                    cy.getCommandFormSubmissionButton().should('be.disabled');
                });
            });

            describe(`when the language selection is empty`, () => {
                it(`should disable the form`, () => {
                    cy.getByDataAttribute('text_translation').click().type(translationText);

                    cy.getCommandFormSubmissionButton().should('be.disabled');
                });
            });
        });

        describe(`when the form is complete`, () => {
            it(`should add the translation`, () => {
                cy.contains(commandLabel).click();

                cy.getByDataAttribute('text_translation').click().type(translationText);

                cy.getByDataAttribute('languageCode_select')
                    .click()
                    .get(`[data-value="${translationLanguageCode}"`)
                    .click();

                cy.getCommandFormSubmissionButton().click();

                cy.acknowledgeCommandResult();

                cy.getByDataAttribute('ExpandMoreIcon').click();

                cy.contains(translationText);
            });

            it(`should prevent duplicate translations`, () => {
                cy.contains(commandLabel).click();

                cy.getByDataAttribute('text_translation').click().type(`duplicate translation`);

                cy.getByDataAttribute('languageCode_select')
                    .click()
                    .get(`[data-value="${translationLanguageCode}"`)
                    .click();

                cy.getCommandFormSubmissionButton().click();

                cy.contains('error', { matchCase: false });

                cy.contains('duplicate translation');
            });
        });
    });
});
