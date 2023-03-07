import { IPlayListViewModel } from '@coscrad/api-interfaces';
import { CoscradMultilingualText, NonEmptyString } from '@coscrad/data-types';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Playlist } from '../../../domain/models/playlist';
import formatAggregateCompositeIdentifier from '../../presentation/formatAggregateCompositeIdentifier';
import { BaseViewModel } from './base.view-model';

/**
 * Note that in the future we anticipate the Playlist becoming something other
 * than a resource. This may be a "report" or a "user defined view". It is really
 * a configured custom view of multiple resources.
 *
 * As such, we do not want to encourage making many web of knowledge connections
 * or notes about the playlist and will only support general context in connections
 * for playlists.
 */
export class PlaylistViewModel extends BaseViewModel implements IPlayListViewModel {
    @CoscradMultilingualText({
        label: 'name',
        description: 'name of the playlist',
    })
    readonly name: MultilingualText;

    /**
     * TODO[https://www.pivotaltracker.com/story/show/184634347]
     *
     * We need a view model for playlist episodes. We also need a polymorphic method
     * for playlistable resources to `buildPlaylistEpisode`, which we can map over
     * here.
     */
    @NonEmptyString({
        isArray: true,
        isOptional: true,
        label: 'episodes',
        description: 'a summary description of each episode in this playlist',
    })
    // TODO establish a view model for episodes
    readonly episodes: string[];

    constructor({ id, name, items }: Playlist) {
        super({ id });

        this.name = name.clone();

        // TODO establish a view model for episodes
        this.episodes = items.map(({ resourceCompositeIdentifier }) =>
            formatAggregateCompositeIdentifier(resourceCompositeIdentifier)
        );
    }
}
