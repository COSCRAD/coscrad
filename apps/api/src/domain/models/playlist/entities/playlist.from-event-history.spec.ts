import { TestEventStream } from '../../../../test-data/events';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { PlaylistCreated } from '../commands/playlist-created.event';
import { Playlist } from './playlist.entity';

const playlistId = buildDummyUuid(12);

const aggregateCompositeIdentifier = {
    type: AggregateType.playlist,
    id: playlistId,
};

const playlistCreated = new TestEventStream().andThen<PlaylistCreated>({
    type: `PLAYLIST_CREATED`,
    payload: {},
});

// const _audioItemAddedForPlaylist = new TestEventStream().andThen<AudioItemAddedToPlaylist>({
//     type: `AUDIO_ITEM_ADDED_TO_PLAYLIST`,
//     payload: {},
// });

// const _audioItemsImportedToPlaylist = new TestEventStream().andThen<AudioItemsImportedToPlaylist>({
//     type: `AUDIO_ITEMS_IMPORTED_TO_PLAYLIST`,
//     payload: {},
// });

// const _playlistNameTranslated = new TestEventStream().andThen<PlaylistNameTranslated>({
//     type: `PLAYLIST_NAME_TRANSLATED`,
//     payload: {},
// });

describe(`Playlist.fromEventhistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when there is a creation event`, () => {
            it(`should create a playlist`, () => {
                const result = Playlist.fromEventHistory(
                    playlistCreated.as(aggregateCompositeIdentifier),
                    playlistId
                );

                expect(result).toBeInstanceOf(Playlist);

                const playlist = result as Playlist;

                expect(playlist).toBe(playlist);
            });
        });

        describe(`when the playlist name has been translated`, () => {
            it.todo(``);
        });

        describe(`when a single audio item has been added`, () => {
            it.todo(``);
        });

        describe(`when audio items have been imported`, () => {
            it.todo(``);
        });

        describe(`when the playlist has been published`, () => {
            it.todo(``);
        });

        describe(`when a user has been granted read access to the playlist`, () => {
            it.todo(`should succeed with the expected update`);
        });
    });
});
