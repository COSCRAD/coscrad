import { AggregateType } from '../../../types/AggregateType';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { PlaylistItem } from './playlist-item.entity';
import { Playlist } from './playlist.entity';

const dto = getValidAggregateInstanceForTest(AggregateType.playlist).clone({
    items: [],
});

const dummyAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

describe(`Playlist`, () => {
    describe(`when adding items`, () => {
        it(`should consistently report whether there are items via *has*`, () => {
            const playlist = new Playlist(dto);

            const itemToAdd = new PlaylistItem({
                resourceCompositeIdentifier: dummyAudioItem.getCompositeIdentifier(),
            });

            expect(playlist.has(itemToAdd.resourceCompositeIdentifier)).toBe(false);

            const updatedPlaylist = playlist.addItem(itemToAdd) as Playlist;

            expect(updatedPlaylist.has(itemToAdd.resourceCompositeIdentifier)).toBe(true);
        });
    });
});
