import { AggregateType, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

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

        describe(`when a time range is selected in the Audio player`, () => {
            const inPointSeconds = 1.5;

            const outPointSeconds = 3.0;

            beforeEach(() => {
                cy.get('audio').then(([audioElement]) => {
                    audioElement.play();
                });

                cy.get('audio').then(([audioElement]) => {
                    audioElement.currentTime = inPointSeconds;
                });

                cy.getByDataAttribute('in-point-marker-button').click();

                cy.get('audio').then(([audioElement]) => {
                    audioElement.currentTime = outPointSeconds;
                });

                cy.getByDataAttribute('out-point-marker-button').click();
            });

            it('should show the annotation form', () => {
                cy.getByDataAttribute('create-note-about-audio-form');
            });

            describe(`the form`, () => {
                it('should be disabled', () => {
                    cy.getByDataAttribute('submit-note').should('be.disabled');
                });
            });

            describe(`when the form is complete`, () => {
                const newAnnotationText = 'This is an interesting comment.';

                const languageCodeForAnnotation = 'en';

                beforeEach(() => {
                    cy.getByDataAttribute('text:note').type(newAnnotationText);

                    cy.getByDataAttribute('select:language').as('language-select').click();

                    cy.get('@language-select')
                        .get(`[data-value="${languageCodeForAnnotation}"]`)
                        .click();
                });

                describe(`the annotation submit button`, () => {
                    it('should be enabled', () => {
                        cy.getByDataAttribute('submit-note').should('be.enabled');
                    });
                });

                describe(`when the form is submitted`, () => {
                    beforeEach(() => {
                        cy.getByDataAttribute('submit-note').click();
                    });

                    it(`should display the note with correct time range`, () => {
                        cy.getByDataAttribute('open-notes-panel-button').click();

                        cy.getByDataAttribute('self-note-time-range-context')
                            .invoke('text')
                            .then((timeRangeJson) => {
                                const timeRange = JSON.parse(timeRangeJson);

                                const { inPointMilliseconds, outPointMilliseconds } = timeRange;

                                const tolerance = 0.2;

                                expect(
                                    millisecondsToRoundedSeconds(inPointMilliseconds)
                                ).to.be.closeTo(inPointSeconds, tolerance);

                                expect(
                                    millisecondsToRoundedSeconds(outPointMilliseconds)
                                ).to.be.closeTo(outPointSeconds, tolerance);
                            });
                    });

                    describe(`before the successful command is acknowledged, the annotation form`, () => {
                        beforeEach(() => {
                            cy.get('audio').then(([audioElement]) => {
                                audioElement.play();
                            });

                            cy.get('audio').then(([audioElement]) => {
                                audioElement.currentTime = inPointSeconds;
                            });

                            cy.getByDataAttribute('in-point-marker-button').click();

                            cy.get('audio').then(([audioElement]) => {
                                audioElement.currentTime = outPointSeconds;
                            });

                            cy.getByDataAttribute('out-point-marker-button').click();
                        });

                        it(`should be disabled`, () => {
                            cy.getByDataAttribute('note-form-ui-feedback').should('exist');

                            cy.getByDataAttribute('note-form').should('not.exist');
                        });
                    });
                });
            });
        });
    });
});
