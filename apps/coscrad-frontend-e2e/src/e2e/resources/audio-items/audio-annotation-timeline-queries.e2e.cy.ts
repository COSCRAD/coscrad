import {
    AggregateType,
    EdgeConnectionContextType,
    ITimeRangeContext,
    LanguageCode,
    MIMEType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
const HAVE_ENOUGH_DATA = 4;

const audioCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.audioItem, 1);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    2
);

const nubmerOfNotes = 5;

const langaugeCodeForNotes = LanguageCode.Chilcotin;

const mediaItemUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock2_370934__karolist__guitar-solo.mp3';

const mediaItemLength = 16000;

const buildTimeRangeContext = (index): ITimeRangeContext => {
    const stepSizeMilliseconds = mediaItemLength / nubmerOfNotes;

    const paddingMilliseconds = 50;

    const inPointMilliseconds = index * stepSizeMilliseconds + paddingMilliseconds;

    const outPointMilliseconds =
        index * stepSizeMilliseconds - paddingMilliseconds + stepSizeMilliseconds;

    return {
        type: EdgeConnectionContextType.timeRange,
        timeRange: {
            inPointMilliseconds,
            outPointMilliseconds,
        },
    };
};

const createNotePayloadOverrides = Array(nubmerOfNotes)
    .fill(0)
    .map((_, index) => index)
    .map((index) => buildDummyAggregateCompositeIdentifier(AggregateType.note, index + 10))
    .map((aggregateCompositeIdentifier, index) => ({
        // we are creating a note
        aggregateCompositeIdentifier,
        // The note is about this audio item
        resourceCompositeIdentifier: audioCompositeIdentifier,
        resourceContext: buildTimeRangeContext(index),
        text: `this is the note for annotation: ${aggregateCompositeIdentifier.id}`,
        languageCode: langaugeCodeForNotes,
    }));
const { id: audioItemId } = audioCompositeIdentifier;

const buildDetailRoute = (audioItemId: string) => `/Resources/AudioItems/${audioItemId}`;

const annotationTrackTestId = 'timeline:Annotation Track';

describe(`the audio item detail view`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(40);

        cy.executeCommandStreamByName('users:create-admin');

        cy.seedDataWithCommand('CREATE_MEDIA_ITEM', {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            url: mediaItemUrl,
            mimeType: MIMEType.wav,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_AUDIO_ITEM`, {
            aggregateCompositeIdentifier: audioCompositeIdentifier,
            mediaItemId: mediaItemCompositeIdentifier.id,
            lengthMilliseconds: mediaItemLength,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: audioCompositeIdentifier,
        });
    });

    describe(`the presentation of annotations`, () => {
        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.audioItem);

            cy.get(`[href="${buildDetailRoute(audioItemId)}"]`).click();
        });

        describe(`when there are no annotations`, () => {
            it(`should show no annotations`, () => {
                cy.getByDataAttribute(annotationTrackTestId).should('not.exist');
            });
        });

        describe(`when there are several annotations`, () => {
            before(() => {
                // for (const payloadOverrides of createNotePayloadOverrides) {
                //     cy.seedDataWithCommand('CREATE_NOTE_ABOUT_RESOURCE', payloadOverrides);
                // }

                // TODO Handle the others
                cy.seedDataWithCommand('CREATE_NOTE_ABOUT_RESOURCE', createNotePayloadOverrides[0]);
            });

            createNotePayloadOverrides
                // TODO test all labels and their relative layout
                .filter((_, index) => index === 0)
                .forEach((payloadOverrides) => {
                    const {
                        aggregateCompositeIdentifier: { id: noteId },
                        resourceContext: {
                            timeRange: { inPointMilliseconds, outPointMilliseconds },
                        },
                    } = payloadOverrides;

                    describe(`annotation: ${noteId}`, () => {
                        // TODO Assert that the order of labels is correct
                        describe(`the timeline labels for the given annotation`, () => {
                            describe(`the label for the in point`, () => {
                                it(`should be displayed on the timeline`, () => {
                                    cy.getByDataAttribute(`timeline-label:${noteId}:in`);
                                });

                                describe(`when clicked`, () => {
                                    beforeEach(() => {
                                        cy.getByDataAttribute(
                                            `timeline-label:${noteId}:in`
                                        ).click();

                                        cy.get('audio').then(([audioElement]) => {
                                            audioElement.play();
                                        });
                                    });

                                    it(`should cause the audio to scrub to the correct point`, () => {
                                        cy.get('audio').then(([audioElement]) => {
                                            expect(audioElement.currentTime).to.be.closeTo(
                                                inPointMilliseconds / 1000, // ms
                                                0.0005 // ms
                                            );
                                        });
                                    });
                                });
                            });

                            describe(`the label for the out point`, () => {
                                it(`should be displayed on the timeline`, () => {
                                    cy.getByDataAttribute(`timeline-label:${noteId}:out`);
                                });

                                describe(`when clicked`, () => {
                                    beforeEach(() => {
                                        cy.getByDataAttribute(
                                            `timeline-label:${noteId}:out`
                                        ).click();
                                    });

                                    it(`should cause the audio to scrub to the correct point`, () => {
                                        cy.get('audio')
                                            .its('currentTime')
                                            .should('be.closeTo', outPointMilliseconds);
                                    });
                                });
                            });
                        });
                    });
                });
        });
    });
});
