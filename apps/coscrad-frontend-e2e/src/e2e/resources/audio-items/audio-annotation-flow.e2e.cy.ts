import { AggregateType, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { Steps, buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

const audioTitleInLanguage = 'Audio Title (Lang)';

const basicAudioAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.audioItem,
    1
);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    21
);

const { id: basicAudioId } = basicAudioAggregateCompositeIdentifier;

const audioDetailRoute = `/Resources/AudioItems/${basicAudioId}`;

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock2_370934__karolist__guitar-solo.mp3';

const buildDetailRoute = (audioItemId: string) => `/Resources/AudioItems/${audioItemId}`;

const millisecondsToRoundedSeconds = (milliseconds: number) => {
    const seconds = milliseconds / 1000;

    // round to one decimal place
    return Math.round(seconds * 10) / 10;
};

describe('the audio annotation process', () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(50);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand('CREATE_MEDIA_ITEM', {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            url: validUrl,
            mimeType: MIMEType.wav,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_AUDIO_ITEM`, {
            name: audioTitleInLanguage,
            aggregateCompositeIdentifier: basicAudioAggregateCompositeIdentifier,
            mediaItemId: mediaItemCompositeIdentifier.id,
            lengthMilliseconds: 16000,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: basicAudioAggregateCompositeIdentifier,
        });
    });

    describe(`when the user is not logged in`, () => {
        beforeEach(() => {
            cy.visit(audioDetailRoute);
        });

        // Skip until we have a way to check for admin access
        it(`should render the audio title`, () => {
            cy.contains(audioTitleInLanguage);

            cy.getByDataAttribute('in-point-marker-button').should('not.exist');
        });
    });

    describe(`when the user is logged in and the audio-item detail page is loaded`, () => {
        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.audioItem);

            cy.get(`[href="${buildDetailRoute(basicAudioId)}"]`).click();
        });

        const inPointSeconds = 1.5;

        const outPointSeconds = 3.0;

        const newAnnotationText = 'This is an interesting comment.';

        const languageCodeForAnnotation = 'en';

        const setTimeRange = 'setTimeRange';

        const fillTextForm = 'fillTextForm';

        const chooseLanguage = 'chooseLanguage';

        const submitForm = 'submitForm';

        const acknowledgeCommandSuccess = 'acknowledgeCommandSuccess';

        const steps = new Steps()
            .addStep(setTimeRange, () => {
                cy.get('audio').then(([audioElement]) => {
                    audioElement.play();
                    audioElement.currentTime = inPointSeconds;
                });

                cy.getByDataAttribute('in-point-marker-button').should('not.be.disabled');

                cy.getByDataAttribute('in-point-marker-button').click();

                cy.get('audio').then(([audioElement]) => {
                    audioElement.currentTime = outPointSeconds;
                });

                cy.getByDataAttribute('out-point-marker-button').should('not.be.disabled');

                cy.getByDataAttribute('out-point-marker-button').click();
            })
            .addStep(fillTextForm, () => {
                cy.getByDataAttribute('text:note').type(newAnnotationText);
            })
            .addStep(chooseLanguage, () => {
                cy.getByDataAttribute('select:language').as('language-select').click();

                cy.get('@language-select')
                    .get(`[data-value="${languageCodeForAnnotation}"]`)
                    .click();
            })
            .addStep(submitForm, () => {
                cy.getByDataAttribute('submit-note').click();
            })
            .addStep(acknowledgeCommandSuccess, () => {
                cy.getByDataAttribute(`command-ack-button`).click();
            });

        describe(`when a time range is first selected in the Audio player`, () => {
            beforeEach(() => {
                steps.apply([setTimeRange]);
            });

            it('should show the annotation form', () => {
                cy.getByDataAttribute('create-note-about-audio-form');
            });

            it('should not show the command panel', () => {
                cy.getByDataAttribute('command-selection-area').should('not.exist');
            });
        });

        describe(`the form`, () => {
            beforeEach(() => {
                steps.apply([setTimeRange]);
            });

            it('should be disabled', () => {
                cy.getByDataAttribute('submit-note').should('be.disabled');
            });
        });

        describe(`when the form is complete`, () => {
            describe(`the annotation submit button`, () => {
                beforeEach(() => {
                    steps.apply([setTimeRange, fillTextForm, chooseLanguage]);
                });

                it('should be enabled', () => {
                    cy.getByDataAttribute('submit-note').should('be.enabled');
                });
            });

            describe(`when the form is submitted (prior to acknowledgement)`, () => {
                beforeEach(() => {
                    steps.apply([setTimeRange, fillTextForm, chooseLanguage, submitForm]);
                });

                it(`should display the note with correct time range`, () => {
                    cy.getByDataAttribute('open-notes-panel-button').click();

                    cy.getByDataAttribute('self-note-time-range-context')
                        .invoke('text')
                        .then((timeRangeJson) => {
                            const timeRange = JSON.parse(timeRangeJson);

                            const { inPointMilliseconds, outPointMilliseconds } = timeRange;

                            const tolerance = 0.2;

                            expect(millisecondsToRoundedSeconds(inPointMilliseconds)).to.be.closeTo(
                                inPointSeconds,
                                tolerance
                            );

                            expect(
                                millisecondsToRoundedSeconds(outPointMilliseconds)
                            ).to.be.closeTo(outPointSeconds, tolerance);
                        });
                });
            });

            describe(`before the successful command is acknowledged`, () => {
                beforeEach(() => {
                    steps.apply([setTimeRange, fillTextForm, chooseLanguage, submitForm]);
                });

                it(`should be disabled`, () => {
                    cy.getByDataAttribute('command-succeeded-notification').should('exist');

                    cy.getByDataAttribute('note-form').should('not.exist');
                });
            });

            describe(`when the successful command has been acknowledged`, () => {
                beforeEach(() => {
                    steps.apply([
                        setTimeRange,
                        fillTextForm,
                        chooseLanguage,
                        submitForm,
                        acknowledgeCommandSuccess,
                    ]);
                });

                describe(`the annotation form`, () => {
                    it(`should no longer be present`, () => {
                        cy.getByDataAttribute('note-form').should('not.exist');
                    });
                });

                describe(`the time range`, () => {
                    it(`should be cleared`, () => {
                        cy.getByDataAttribute('in-point-selection-time-code').should('not.exist');

                        cy.getByDataAttribute('inpoint-selected-bar').should('not.be.visible');
                    });
                });
            });
        });
    });
});
