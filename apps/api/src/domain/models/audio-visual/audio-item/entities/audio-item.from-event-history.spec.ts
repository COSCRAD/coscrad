import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { NotFound, isNotFound } from '../../../../../lib/types/not-found';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../../shared/common-commands';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';
import { LineItemAddedToTranscript } from '../../shared/commands/transcripts/add-line-item-to-transcript/line-item-added-to-transcript.event';
import { ParticipantAddedToTranscript } from '../../shared/commands/transcripts/add-participant-to-transcript/participant-added-to-transcript.event';
import { TranscriptCreated } from '../../shared/commands/transcripts/create-transcript/transcript-created.event';
import { LineItemsImportedToTranscript } from '../../shared/commands/transcripts/import-line-items-to-transcript/line-items-imported-to-transcript.event';
import { TranscriptItem } from '../../shared/entities/transcript-item.entity';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { LineItemTranslated, TranslationsImportedForTranscript } from '../commands';
import { AudioItemCreated } from '../commands/create-audio-item/audio-item-created.event';
import { AudioItemNameTranslated } from '../commands/translate-audio-item-name/audio-item-name-translated-event';
import { AudioItem } from './audio-item.entity';

const audioItemId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

const audioItemNameText = 'name of audio item in original language';

const originalLanguageCodeForName = LanguageCode.Chilcotin;

const translationLanguageCodeForName = LanguageCode.English;

const lengthMilliseconds = 23400;

const mediaItemId = buildDummyUuid(2);

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
    payload: {
        name: audioItemNameText,
        languageCodeForName: originalLanguageCodeForName,
        lengthMilliseconds,
        mediaItemId,
    },
});

const textForNameTranslation = 'translation of the audio item name';

const audioItemNameTranslated = audioItemCreated.andThen<AudioItemNameTranslated>({
    type: 'AUDIO_ITEM_NAME_TRANSLATED',
    payload: {
        text: textForNameTranslation,
        languageCode: translationLanguageCodeForName,
    },
});

const transcriptCreated = audioItemNameTranslated.andThen<TranscriptCreated>({
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

const audioItemPublished = lineItemTranslated.andThen<ResourcePublished>({
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

describe(`AudioItem.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the audio item is first created`, () => {
            it(`should create an Audio Item with the correct state`, () => {
                // act
                const result = AudioItem.fromEventHistory(
                    audioItemCreated.as(aggregateCompositeIdentifier),
                    audioItemId
                );

                expect(result).toBeInstanceOf(AudioItem);

                const audioItem = result as AudioItem;

                const {
                    name,
                    mediaItemId: foundMediaItemId,
                    lengthMilliseconds: foundLengthMilliseconds,
                } = audioItem;

                const { text: foundText, languageCode: foundLanguageCode } =
                    name.getOriginalTextItem();

                expect(foundText).toBe(audioItemNameText);

                expect(foundLanguageCode).toBe(originalLanguageCodeForName);

                expect(foundMediaItemId).toBe(mediaItemId);

                expect(foundLengthMilliseconds).toBe(lengthMilliseconds);

                expect(audioItem.published).toBe(false);
            });
        });

        describe(`when the name has been translated`, () => {
            it(`should return an Audio Item with the correct translation for the name`, () => {
                const result = AudioItem.fromEventHistory(
                    audioItemNameTranslated.as(aggregateCompositeIdentifier),
                    audioItemId
                );

                expect(result).toBeInstanceOf(AudioItem);

                const audioItem = result as AudioItem;

                const nameTranslationSearchResult = audioItem.name.getTranslation(
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
            it(`should return an Audio Item with an empty transcript`, () => {
                const result = AudioItem.fromEventHistory(
                    transcriptCreated.as(aggregateCompositeIdentifier),
                    audioItemId
                );

                expect(result).toBeInstanceOf(AudioItem);

                const audioItem = result as AudioItem;

                expect(audioItem.hasTranscript()).toBe(true);

                expect(audioItem.countTranscriptParticipants()).toBe(0);
            });
        });

        describe(`when a participant has been added to the transcript`, () => {
            const result = AudioItem.fromEventHistory(
                anotherParticipantAddedToTranscript.as(aggregateCompositeIdentifier),
                audioItemId
            );

            expect(result).toBeInstanceOf(AudioItem);

            const audioItem = result as AudioItem;

            participantInitials.forEach((initials, index) => {
                const participantSearchResult =
                    audioItem.transcript.findParticipantByInitials(initials);

                expect(participantSearchResult).not.toBe(NotFound);

                const { name } = participantSearchResult as TranscriptParticipant;

                expect(name).toBe(participantNames[index]);
            });
        });

        describe(`when a transcript has been created using the system to add one line item at a time`, () => {
            const audioItem = AudioItem.fromEventHistory(
                lineItemsAddedToTranscriptOneAtATime.as(aggregateCompositeIdentifier),
                audioItemId
            );

            if (isInternalError(audioItem) || isNotFound(audioItem)) {
                throw new Error(`Test setup failed: ${JSON.stringify(audioItem)}}`);
            }

            lineItemsToCreate.forEach(
                ({ inPointMilliseconds, outPointMilliseconds, text, speakerInitials }) => {
                    describe(`[${inPointMilliseconds},${outPointMilliseconds}] ${text}`, () => {
                        it(`should exist in the transcript`, () => {
                            const searchResult = audioItem.transcript.getLineItem(
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
                const result = AudioItem.fromEventHistory(
                    lineItemTranslated.as(aggregateCompositeIdentifier),
                    audioItemId
                );

                expect(result).toBeInstanceOf(AudioItem);

                const audioItem = result as AudioItem;

                const { transcript } = audioItem;

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

        describe(`when the audio item has been published`, () => {
            it(`should return an audio item that is published`, () => {
                const result = AudioItem.fromEventHistory(
                    audioItemPublished.as(aggregateCompositeIdentifier),
                    audioItemId
                );

                expect(result).toBeInstanceOf(AudioItem);

                const audioItem = result as AudioItem;

                expect(audioItem.published).toBe(true);
            });
        });

        describe(`when a user has been granted read access`, () => {
            it(`should allow access to the user`, () => {
                const result = AudioItem.fromEventHistory(
                    readAccessGranted.as(aggregateCompositeIdentifier),
                    audioItemId
                );

                expect(result).toBeInstanceOf(AudioItem);

                const audioItem = result as AudioItem;

                expect(audioItem.queryAccessControlList.canUser(userId)).toBe(true);
            });
        });

        describe(`when importing a pre-existing transcript`, () => {
            describe(`when line items have been imported`, () => {
                it(`should import all of the line items`, () => {
                    const result = AudioItem.fromEventHistory(
                        lineItemsImportedToTranscript.as(aggregateCompositeIdentifier),
                        audioItemId
                    );

                    expect(result).toBeInstanceOf(AudioItem);
                });
            });

            describe(`when translations have been imported`, () => {
                const audioItem = AudioItem.fromEventHistory(
                    translationsImportedForTranscript.as(aggregateCompositeIdentifier),
                    audioItemId
                ) as AudioItem;

                translationItems.forEach(
                    ({ inPointMilliseconds, outPointMilliseconds, translation, languageCode }) => {
                        describe(`[${inPointMilliseconds}] ${translation} {${languageCode}}`, () => {
                            it(`should have a exist in the transcript`, () => {
                                const foundTranslation = audioItem.transcript.getLineItem(
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
        describe(`when there are no events for the given Audio Item`, () => {
            it(`should return not found`, () => {
                const result = AudioItem.fromEventHistory(
                    audioItemCreated.as({
                        type: AggregateType.audioItem,
                        id: buildDummyUuid(999),
                    }),
                    audioItemId
                );

                expect(result).toBe(NotFound);
            });
        });

        describe(`when the creation event is missing`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    AudioItem.fromEventHistory(
                        transcriptCreated.as(aggregateCompositeIdentifier).slice(1),
                        audioItemId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        describe(`when there is invalid data for an existing creation event`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    AudioItem.fromEventHistory(
                        new TestEventStream()
                            .andThen<AudioItemCreated>({
                                type: 'AUDIO_ITEM_CREATED',
                                payload: {
                                    lengthMilliseconds: -100,
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        audioItemId
                    );
                };

                expect(eventSource).toThrow();
            });
        });

        describe(`when there is invalid data for an existing update event`, () => {
            it(`should throw`, () => {
                const eventSource = () => {
                    AudioItem.fromEventHistory(
                        audioItemCreated
                            .andThen<AudioItemCreated>({
                                type: 'AUDIO_ITEM_CREATED',
                                payload: {
                                    languageCodeForName: 'FOO-Bar-baz66' as LanguageCode,
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        audioItemId
                    );
                };

                expect(eventSource).toThrow();
            });
        });
    });
});
