import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../commands/create-audio-item/transcript-created.event';
import { AudioItem } from './audio-item.entity';

const audioItemId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

const audioItemNameText = 'name of audio item in original language';

const originalLanguageCodeForName = LanguageCode.Chilcotin;

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
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given Audio Item`, () => {
            it.todo(`should return not found`);
        });

        describe(`when the creation event is missing`, () => {
            it.todo(`should throw`);
        });

        describe(`when there is invalid data for an existing creation event`, () => {
            it.todo(`should throw`);
        });

        describe(`when there is invalid data for an existing update event`, () => {
            it.todo(`should throw`);
        });
    });
});
