import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { NotFound, isNotFound } from '../../../../../lib/types/not-found';
import { TestEventStream } from '../../../../../test-data/events';
import { MultilingualTextItem } from '../../../../common/entities/multilingual-text';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../../shared/common-commands';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';
import { LineItemTranslated, TranslationsImportedForTranscript } from '../../audio-item/commands';
import { LineItemAddedToTranscript } from '../../shared/commands/transcripts/add-line-item-to-transcript/line-item-added-to-transcript.event';
import { ParticipantAddedToTranscript } from '../../shared/commands/transcripts/add-participant-to-transcript/participant-added-to-transcript.event';
import { TranscriptCreated } from '../../shared/commands/transcripts/create-transcript/transcript-created.event';
import { LineItemsImportedToTranscript } from '../../shared/commands/transcripts/import-line-items-to-transcript/line-items-imported-to-transcript.event';
import { TranscriptItem } from '../../shared/entities/transcript-item.entity';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { VideoCreated, VideoNameTranslated } from '../commands';
import { Video } from './video.entity';

const videoItemId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.video,
    id: videoItemId,
};

const videoNameText = 'name of video in original language';

const originalLanguageCodeForName = LanguageCode.Chilcotin;

const translationLanguageCodeForName = LanguageCode.English;

const lengthMilliseconds = 23400;

const mediaItemId = buildDummyUuid(2);

const videoCreated = new TestEventStream().andThen<VideoCreated>({
    type: 'VIDEO_CREATED',
    payload: {
        name: videoNameText,
        languageCodeForName: originalLanguageCodeForName,
        lengthMilliseconds,
        mediaItemId,
    },
});

const textForNameTranslation = 'translation of the video name';

const videoNameTranslated = videoCreated.andThen<VideoNameTranslated>({
    type: 'VIDEO_NAME_TRANSLATED',
    payload: {
        text: textForNameTranslation,
        languageCode: translationLanguageCodeForName,
    },
});

const transcriptCreated = videoNameTranslated.andThen<TranscriptCreated>({
    type: 'TRANSCRIPT_CREATED',
});

const participantInitials = ['AP', 'JB'];

const participantNames = ['Aaron Plahn', 'Joey Bob'];

const participantAddedToTranscript = transcriptCreated.andThen<ParticipantAddedToTranscript>({
    type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
    payload: {
        initials: participantInitials[0],
        name: participantNames[0],
    },
});

const anotherParticipantAddedToTranscript =
    participantAddedToTranscript.andThen<ParticipantAddedToTranscript>({
        type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
        payload: {
            initials: participantInitials[1],
            name: participantNames[1],
        },
    });

const numberOfLineItemsPerParticipant = 10;

const numberOfLineItems = numberOfLineItemsPerParticipant * participantInitials.length;

const lineItemsToCreate = participantInitials
    .flatMap((initials) => Array(numberOfLineItemsPerParticipant).fill(initials))
    .map((initials, index) => {
        const offset = lengthMilliseconds / numberOfLineItems;

        const padding = 0.05 * offset;

        const inPointMilliseconds = index * offset + padding;

        const outPointMilliseconds = (index + 1) * offset - padding;

        return {
            inPointMilliseconds,
            outPointMilliseconds,
            text: `This is the text for language item: ${index}`,
            speakerInitials: initials,
        };
    });

const languageCodeForTranscription = LanguageCode.Chilcotin;

const languageCodeForTranscriptTranslation = LanguageCode.English;

const lineItemsAddedToTranscriptOneAtATime = lineItemsToCreate.reduce(
    (eventStreamSoFar, { inPointMilliseconds, outPointMilliseconds, text, speakerInitials }) =>
        eventStreamSoFar.andThen<LineItemAddedToTranscript>({
            type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
            payload: {
                inPointMilliseconds,
                outPointMilliseconds,
                text,
                languageCode: languageCodeForTranscription,
                speakerInitials,
            },
        }),
    anotherParticipantAddedToTranscript
);

const { inPointMilliseconds: inPointForTranslation, outPointMilliseconds: outPointForTranslation } =
    lineItemsToCreate[0];

const lineItemTranslationText = 'This is what was said (in English).';

const lineItemTranslated = lineItemsAddedToTranscriptOneAtATime.andThen<LineItemTranslated>({
    type: 'LINE_ITEM_TRANSLATED',
    payload: {
        inPointMilliseconds: inPointForTranslation,
        outPointMilliseconds: outPointForTranslation,
        translation: lineItemTranslationText,
        languageCode: languageCodeForTranscriptTranslation,
    },
});

const videoPublished = lineItemTranslated.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

const lineItemsImportedToTranscript =
    anotherParticipantAddedToTranscript.andThen<LineItemsImportedToTranscript>({
        type: 'LINE_ITEMS_IMPORTED_TO_TRANSCRIPT',
        payload: {
            lineItems: lineItemsToCreate.map((props) => ({
                ...props,
                languageCode: languageCodeForTranscription,
            })),
        },
    });

const translationItems = lineItemsToCreate.map(
    ({ inPointMilliseconds, outPointMilliseconds }, index) => ({
        inPointMilliseconds,
        outPointMilliseconds,
        translation: `this is the translation for the item: ${index}`,
        languageCode: languageCodeForTranscriptTranslation,
    })
);

const translationsImportedForTranscript =
    lineItemsImportedToTranscript.andThen<TranslationsImportedForTranscript>({
        type: 'TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT',
        payload: {
            translationItems,
        },
    });

const userId = buildDummyUuid(5);

const readAccessGranted =
    translationsImportedForTranscript.andThen<ResourceReadAccessGrantedToUser>({
        type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
        payload: {
            userId,
        },
    });

describe(`Video.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the video item is first created`, () => {
            it(`should create an Video with the correct state`, () => {
                // act
                const result = Video.fromEventHistory(
                    videoCreated.as(aggregateCompositeIdentifier),
                    videoItemId
                );

                expect(result).toBeInstanceOf(Video);

                const video = result as Video;

                const {
                    name,
                    mediaItemId: foundMediaItemId,
                    lengthMilliseconds: foundLengthMilliseconds,
                } = video;

                const { text: foundText, languageCode: foundLanguageCode } =
                    name.getOriginalTextItem();

                expect(foundText).toBe(videoNameText);

                expect(foundLanguageCode).toBe(originalLanguageCodeForName);

                expect(foundMediaItemId).toBe(mediaItemId);

                expect(foundLengthMilliseconds).toBe(lengthMilliseconds);

                expect(video.published).toBe(false);
            });
        });

        describe(`when the name has been translated`, () => {
            it(`should return an video with the correct translation for the name`, () => {
                const result = Video.fromEventHistory(
                    videoNameTranslated.as(aggregateCompositeIdentifier),
                    videoItemId
                );

                expect(result).toBeInstanceOf(Video);

                const video = result as Video;

                const nameTranslationSearchResult = video.name.getTranslation(
                    translationLanguageCodeForName
                );

                expect(nameTranslationSearchResult).not.toBe(NotFound);

                const { text: foundText, languageCode: foundLanguageCode } =
                    nameTranslationSearchResult as MultilingualTextItem;

                expect(foundText).toBe(textForNameTranslation);

                expect(foundLanguageCode).toBe(translationLanguageCodeForName);
            });
        });

        describe(`when a transcript has been created`, () => {
            it(`should return an video with an empty transcript`, () => {
                const result = Video.fromEventHistory(
                    transcriptCreated.as(aggregateCompositeIdentifier),
                    videoItemId
                );

                expect(result).toBeInstanceOf(Video);

                const video = result as Video;

                expect(video.hasTranscript()).toBe(true);

                expect(video.countTranscriptParticipants()).toBe(0);
            });
        });

        describe(`when a participant has been added to the transcript`, () => {
            const result = Video.fromEventHistory(
                anotherParticipantAddedToTranscript.as(aggregateCompositeIdentifier),
                videoItemId
            );

            it(`should return a video`, () => {
                expect(result).toBeInstanceOf(Video);
            });

            const video = result as Video;

            participantInitials.forEach((initials, index) => {
                const participantSearchResult =
                    video.transcript.findParticipantByInitials(initials);

                expect(participantSearchResult).not.toBe(NotFound);

                const { name } = participantSearchResult as TranscriptParticipant;

                expect(name).toBe(participantNames[index]);
            });
        });

        describe(`when a transcript has been created using the system to add one line item at a time`, () => {
            const video = Video.fromEventHistory(
                lineItemsAddedToTranscriptOneAtATime.as(aggregateCompositeIdentifier),
                videoItemId
            );

            if (isInternalError(video) || isNotFound(video)) {
                throw new Error(`Test setup failed: ${JSON.stringify(video)}}`);
            }

            lineItemsToCreate.forEach(
                ({ inPointMilliseconds, outPointMilliseconds, text, speakerInitials }) => {
                    describe(`[${inPointMilliseconds},${outPointMilliseconds}] ${text}`, () => {
                        it(`should exist in the transcript`, () => {
                            const searchResult = video.transcript.getLineItem(
                                inPointMilliseconds,
                                outPointMilliseconds
                            );

                            expect(searchResult).not.toBe(NotFound);

                            const transcriptItem = searchResult as TranscriptItem;

                            const { text: foundText, languageCode: foundLanguageCode } =
                                transcriptItem.text.getOriginalTextItem();

                            expect(foundText).toBe(text);

                            expect(foundLanguageCode).toBe(languageCodeForTranscription);

                            expect(transcriptItem.speakerInitials).toBe(speakerInitials);
                        });
                    });
                }
            );
        });

        describe(`when a transcript item has been translated`, () => {
            it(`should have the translation for the line item`, () => {
                const result = Video.fromEventHistory(
                    lineItemTranslated.as(aggregateCompositeIdentifier),
                    videoItemId
                );

                expect(result).toBeInstanceOf(Video);

                const video = result as Video;

                const { transcript } = video;

                const lineItemSearchResult = transcript.getLineItem(
                    inPointForTranslation,
                    outPointForTranslation
                );

                expect(lineItemSearchResult).toBeInstanceOf(TranscriptItem);

                const lineItem = lineItemSearchResult as TranscriptItem;

                const textItemSearchResult = lineItem.text.getTranslation(
                    languageCodeForTranscriptTranslation
                );

                expect(textItemSearchResult).not.toBe(NotFound);

                const { text: foundText, role } = textItemSearchResult as MultilingualTextItem;

                expect(foundText).toBe(lineItemTranslationText);

                expect(role).toBe(MultilingualTextItemRole.freeTranslation);
            });
        });

        describe(`when the video has been published`, () => {
            it(`should return an video that is published`, () => {
                const result = Video.fromEventHistory(
                    videoPublished.as(aggregateCompositeIdentifier),
                    videoItemId
                );

                expect(result).toBeInstanceOf(Video);

                const video = result as Video;

                expect(video.published).toBe(true);
            });
        });

        describe(`when a user has been granted read access`, () => {
            it(`should allow access to the user`, () => {
                const result = Video.fromEventHistory(
                    readAccessGranted.as(aggregateCompositeIdentifier),
                    videoItemId
                );

                expect(result).toBeInstanceOf(Video);

                const video = result as Video;

                expect(video.queryAccessControlList.canUser(userId)).toBe(true);
            });
        });

        describe(`when importing a pre-existing transcript`, () => {
            describe(`when line items have been imported`, () => {
                it(`should import all of the line items`, () => {
                    const result = Video.fromEventHistory(
                        lineItemsImportedToTranscript.as(aggregateCompositeIdentifier),
                        videoItemId
                    );

                    expect(result).toBeInstanceOf(Video);
                });
            });

            describe(`when translations have been imported`, () => {
                const video = Video.fromEventHistory(
                    translationsImportedForTranscript.as(aggregateCompositeIdentifier),
                    videoItemId
                ) as Video;

                translationItems.forEach(
                    ({ inPointMilliseconds, outPointMilliseconds, translation, languageCode }) => {
                        describe(`[${inPointMilliseconds}] ${translation} {${languageCode}}`, () => {
                            it(`should have a exist in the transcript`, () => {
                                const foundTranslation = video.transcript.getLineItem(
                                    inPointMilliseconds,
                                    outPointMilliseconds
                                ) as TranscriptItem;

                                const { text: foundText, languageCode: foundLanguageCode } =
                                    foundTranslation.text.getTranslation(
                                        languageCode
                                    ) as MultilingualTextItem;

                                expect(foundText).toBe(translation);

                                expect(foundLanguageCode).toBe(languageCode);
                            });
                        });
                    }
                );
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given video`, () => {
            it(`should return not found`, () => {
                const result = Video.fromEventHistory(
                    videoCreated.as({
                        type: AggregateType.video,
                        id: buildDummyUuid(999),
                    }),
                    videoItemId
                );

                expect(result).toBe(NotFound);
            });
        });

        describe(`when the creation event is missing`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    Video.fromEventHistory(
                        transcriptCreated.as(aggregateCompositeIdentifier).slice(1),
                        videoItemId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        describe(`when there is invalid data for an existing creation event`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    Video.fromEventHistory(
                        new TestEventStream()
                            .andThen<VideoCreated>({
                                type: 'VIDEO_CREATED',
                                payload: {
                                    lengthMilliseconds: -100,
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        videoItemId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        describe(`when there is invalid data for an existing update event`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    Video.fromEventHistory(
                        videoCreated
                            .andThen<VideoCreated>({
                                type: 'VIDEO_CREATED',
                                payload: {
                                    languageCodeForName: 'FOO-Bar-baz66' as LanguageCode,
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        videoItemId
                    );
                };

                expect(eventSource).toThrow();
            });
        });
    });
});
