import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { TestEventStream } from '../../../../test-data/events';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../shared/common-commands';
import { ResourcePublished } from '../../shared/common-commands/publish-resource/resource-published.event';
import { AudioItemAddedToPlaylist } from '../commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event';
import { AudioItemsImportedToPlaylist } from '../commands/import-audio-items-to-playlist/audio-items-imported-to-playlist.event';
import { PlaylistCreated } from '../commands/playlist-created.event';
import { PlaylistNameTranslated } from '../commands/translate-playlist-name/playlist-name-translated.event';
import { Playlist } from './playlist.entity';

const playlistId = buildDummyUuid(12);

const playlistNameTranslation = 'Translated Name';

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const audioItemId = buildDummyUuid(14);

const aggregateCompositeIdentifier = {
    type: AggregateType.playlist,
    id: playlistId,
};

const playlistCreated = new TestEventStream().andThen<PlaylistCreated>({
    type: `PLAYLIST_CREATED`,
    payload: { name: playlistNameTranslation, languageCodeForName: originalLanguageCode },
});

const playlistNameTranslated = playlistCreated.andThen<PlaylistNameTranslated>({
    type: `PLAYLIST_NAME_TRANSLATED`,
    payload: { text: playlistNameTranslation, languageCode: translationLanguageCode },
});

const audioItemAddedForPlaylist = playlistNameTranslated.andThen<AudioItemAddedToPlaylist>({
    type: `AUDIO_ITEM_ADDED_TO_PLAYLIST`,
    payload: { audioItemId },
});

const audioIdsForImport = [101, 102, 103, 104, 105].map(buildDummyUuid);

const audioItemsImportedToPlaylist =
    audioItemAddedForPlaylist.andThen<AudioItemsImportedToPlaylist>({
        type: `AUDIO_ITEMS_IMPORTED_TO_PLAYLIST`,
        payload: {
            audioItemIds: audioIdsForImport,
        },
    });

const playlistPublished = audioItemsImportedToPlaylist.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

const userId = buildDummyUuid(2);

const readAccessGranted = audioItemsImportedToPlaylist.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: { userId },
});

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

                const { text: foundName, languageCode: foundLanguageCode } =
                    playlist.name.getOriginalTextItem();

                expect(foundName).toBe(playlistNameTranslation);

                expect(foundLanguageCode).toBe(originalLanguageCode);
            });
        });

        describe(`when the playlist name has been translated`, () => {
            it(`should return the translated name`, () => {
                const result = Playlist.fromEventHistory(
                    playlistNameTranslated.as(aggregateCompositeIdentifier),
                    playlistId
                );

                expect(result).toBeInstanceOf(Playlist);

                const playlist = result as Playlist;

                const nameTranslationSearchResult =
                    playlist.name.getTranslation(translationLanguageCode);

                const { text: foundText, role: foundRole } =
                    nameTranslationSearchResult as MultilingualTextItem;

                expect(foundText).toBe(playlistNameTranslation);

                expect(foundRole).toBe(MultilingualTextItemRole.freeTranslation);
            });
        });

        describe(`when a single audio item has been added`, () => {
            it(`should return a playlist with the single audio item`, () => {
                const result = Playlist.fromEventHistory(
                    audioItemAddedForPlaylist.as(aggregateCompositeIdentifier),
                    playlistId
                );

                expect(result).toBeInstanceOf(Playlist);

                const playlist = result as Playlist;

                const doesPlaylistHaveAudioItem = playlist.has({
                    type: AggregateType.audioItem,
                    id: audioItemId,
                });

                expect(doesPlaylistHaveAudioItem).toBe(true);
            });
        });

        describe(`when audio items have been imported`, () => {
            it(`should contain one playlist item for each audio item`, () => {
                const result = Playlist.fromEventHistory(
                    audioItemsImportedToPlaylist.as(aggregateCompositeIdentifier),
                    playlistId
                );

                expect(result).toBeInstanceOf(Playlist);
            });
        });

        describe(`when the playlist has been published`, () => {
            it(`should return a published playlist`, () => {
                const result = Playlist.fromEventHistory(
                    playlistPublished.as(aggregateCompositeIdentifier),
                    playlistId
                );

                expect(result).toBeInstanceOf(Playlist);

                const playlist = result as Playlist;

                expect(playlist.published).toBe(true);
            });
        });

        describe(`when a user has been granted read access to the playlist`, () => {
            it(`should succeed with the expected update`, () => {
                const result = Playlist.fromEventHistory(
                    readAccessGranted.as(aggregateCompositeIdentifier),
                    playlistId
                );

                expect(result).toBeInstanceOf(Playlist);

                const playlist = result as Playlist;

                expect(playlist.queryAccessControlList.canUser(userId)).toBe(true);
            });
        });
    });
});
