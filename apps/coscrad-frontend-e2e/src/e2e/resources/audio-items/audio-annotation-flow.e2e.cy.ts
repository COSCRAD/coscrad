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
            beforeEach(() => {
                cy.get('audio').then(([audioElement]) => {
                    audioElement.play();
                });

                cy.get('audio').then(([audioElement]) => {
                    audioElement.currentTime = 1.5;
                });

                cy.getByDataAttribute('in-point-marker-button').click();

                cy.get('audio').then(([audioElement]) => {
                    audioElement.currentTime = 3.0;
                });

                cy.getByDataAttribute('out-point-marker-button').click();
            });

            it.only('should show the annotation form', () => {
                cy.getByDataAttribute('create-note-about-audio-form');
            });

            describe(`the form`, () => {
                it('should be disabled', () => {
                    cy.getByDataAttribute('submit-note').should('be.disabled');
                });
            });

            describe(`when the form is complete`, () => {
                const newAnnotationText = 'This is an interesting comment.';

                const languageCodeForAnnotation = 'hai';

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
                    it(`should display the note`, () => {
                        cy.getByDataAttribute('submit-note').click();

                        cy.getByDataAttribute('open-notes-panel-button').click();

                        cy.getByDataAttribute('selfNotesPanel').should('exist');
                    });
                });
            });
        });
    });
});
