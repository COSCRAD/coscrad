import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

class Steps {
    private stepsMap: Map<string, () => void>;

    constructor() {
        this.stepsMap = new Map<string, () => void>();
    }

    addStep(stepName: string, step: () => void): this {
        if (this.stepsMap.has(stepName)) {
            throw new Error(`There is already a step with name: ${stepName}`);
        }

        this.stepsMap.set(stepName, step);

        return this;
    }

    apply(namesOfStepsToApply: string[]) {
        namesOfStepsToApply.forEach((stepName) => {
            if (!this.stepsMap.has(stepName)) {
                throw new Error(`Failed to apply unknown step: ${stepName}`);
            }

            const step = this.stepsMap.get(stepName);

            step();
        });
    }
}

describe(`TRANSLATE_LINE_ITEM`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    const baseRoute = `/Resources/Videos/`;

    const commandLabel = 'Translate Line Item';

    const videoCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.video, 1);

    const { id: videoId } = videoCompositeIdentifier;

    const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.mediaItem,
        2
    );

    const detailRoute = `${baseRoute}${videoId}`;

    const participantInitials = 'AP';

    const originalLanguageCode = LanguageCode.Chilcotin;

    const inPointMilliseconds = 100;

    const outPointMilliseconds = 300;

    const lengthMilliseconds = 30000;

    const translationLanguageCode = LanguageCode.Haida;

    const translation = `This is what was said (${translationLanguageCode})`;

    before(() => {
        cy.seedTestUuids(10);

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
            lengthMilliseconds,
            mediaItemId: mediaItemCompositeIdentifier.id,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_TRANSCRIPT`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
        });

        cy.seedDataWithCommand(`ADD_PARTICIPANT_TO_TRANSCRIPT`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
            initials: participantInitials,
        });

        cy.seedDataWithCommand(`ADD_LINE_ITEM_TO_TRANSCRIPT`, {
            aggregateCompositeIdentifier: videoCompositeIdentifier,
            speakerInitials: participantInitials,
            languageCode: originalLanguageCode,
            inPointMilliseconds,
            outPointMilliseconds,
        });
    });

    describe(`when the user is not logged in`, () => {
        beforeEach(() => {
            cy.visit(detailRoute);
        });

        it(`should not display the command`, () => {
            cy.contains(commandLabel).should('not.exist');
        });
    });

    describe(`when the user is logged in`, () => {
        const fillTranslation = () => {
            cy.getByDataAttribute('text_translation').click().type(translation);
        };

        const fillInPointMilliseconds = () => {
            cy.getByDataAttribute('numeric_inPointMilliseconds')
                .click()
                .type(inPointMilliseconds.toString());
        };

        const fillOutPointMilliseconds = () => {
            cy.getByDataAttribute('numeric_outPointMilliseconds')
                .click()
                .type(outPointMilliseconds.toString());
        };

        const fillLanguageCode = () => {
            cy.getByDataAttribute('languageCode_select')
                .click()
                .get(`[data-value="${translationLanguageCode}"`)
                .click();
        };

        const steps = new Steps()
            .addStep('fillTranslation', fillTranslation)
            .addStep('fillInPointMilliseconds', fillInPointMilliseconds)
            .addStep('fillOutPointMilliseconds', fillOutPointMilliseconds)
            .addStep('fillLanguageCode', fillLanguageCode);

        const allStepNames = [
            'fillTranslation',
            'fillInPointMilliseconds',
            'fillOutPointMilliseconds',
            'fillLanguageCode',
        ];

        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(AggregateType.video);

            cy.get(`[href="${detailRoute}"]`).click();

            cy.contains(commandLabel).click();
        });

        describe(`when one of the form fields is incomplete`, () => {
            allStepNames.forEach((nameOfTestToSkip) => {
                describe(`when omitting the step: ${nameOfTestToSkip}`, () => {
                    const namesOfStepsToKeep = allStepNames.filter((n) => n !== nameOfTestToSkip);

                    beforeEach(() => {
                        steps.apply(namesOfStepsToKeep);
                    });

                    it(`should prevent form submission`, () => {
                        cy.getCommandFormSubmissionButton().should('be.disabled');
                    });
                });
            });
        });

        describe(`when the form is complete`, () => {
            describe(`when the command is valid`, () => {
                beforeEach(() => {
                    steps.apply(allStepNames);

                    cy.getCommandFormSubmissionButton().click();

                    cy.acknowledgeCommandResult();
                });

                it(`should succeed`, () => {
                    cy.contains(translation);
                });
            });

            /**
             * TODO We also should check that the user error is returned whenever
             * an invalid in-point or out-point is provided. However, we will eventually
             * "design away" this possibility by allowing the user to use the
             * view of the video \ audio item to select the in-point and outpoint.
             */
        });
    });
});
