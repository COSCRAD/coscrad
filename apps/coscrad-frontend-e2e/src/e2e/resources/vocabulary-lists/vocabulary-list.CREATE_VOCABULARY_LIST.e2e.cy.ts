import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Steps } from '../../../support/utilities';

const commandLabel = `Create Vocabulary List`;

const stepNames = ['fillName', 'fillLanguage'];

const name = 'Nice Vocabulary List';

const languageCode = LanguageCode.Chilcotin;

const steps = new Steps()
    .addStep(stepNames[0], () => {
        cy.getByDataAttribute(`text_name`).click().type(name);
    })
    .addStep(stepNames[1], () => {
        cy.getByDataAttribute('languageCodeForName_select')
            .click()
            .get(`[data-value="${languageCode}"`)
            .click();
    });

describe(`CREATE_VOCABULARY_LIST`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    describe(`when the user is not logged in`, () => {
        beforeEach(() => {
            cy.visit('/');

            cy.navigateToResourceIndex(AggregateType.vocabularyList);
        });

        it(`should not expose the command`, () => {
            cy.contains(commandLabel).should('not.exist');
        });
    });

    describe(`when the user is logged in`, () => {
        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(AggregateType.vocabularyList);

            cy.contains(commandLabel).click();
        });

        describe(`when the form is complete`, () => {
            beforeEach(() => {
                steps.apply(stepNames);

                cy.getCommandFormSubmissionButton().click();

                cy.acknowledgeCommandResult();
            });

            it(`should succeed`, () => {
                cy.contains(name);
            });
        });

        describe(`when the form is incomplete`, () => {
            stepNames.forEach((stepNameToSkip) => {
                describe(`when skipping step: ${stepNameToSkip}`, () => {
                    beforeEach(() => {
                        const stepsToApply = stepNames.filter(
                            (stepName) => stepName !== stepNameToSkip
                        );

                        steps.apply(stepsToApply);
                    });

                    it(`should prevent form submission`, () => {
                        cy.getCommandFormSubmissionButton().should('be.disabled');
                    });
                });
            });
        });
    });
});
