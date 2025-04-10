import { ResourceType } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { AudioItem } from '../../../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { Playlist } from '../../../domain/models/playlist';
import { PlaylistEpisode } from '../../../domain/models/playlist/entities/playlist-episode.entity';
import { CoscradContributor } from '../../../domain/models/user-management/contributor';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import { BaseResourceViewModel } from './base-resource.view-model';

/**
 * Note that in the future we anticipate the Playlist becoming something other
 * than a resource. This may be a "report" or a "user defined view". It is really
 * a configured custom view of multiple resources.
 *
 * As such, we do not want to encourage making many web of knowledge connections
 * or notes about the playlist and will only support general context in connections
 * for playlists.
 */
export class PlaylistViewModel extends BaseResourceViewModel {
    @NestedDataType(MultilingualText, {
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
    readonly episodes: PlaylistEpisode[];

    /**
     * TODO This is not a performant way to handle joins. We have moved to
     * event sourcing most resources, however playlists are somewhat unique in
     * being more closely alligned with CMS concerns than constituting an
     * actual resource in the web of knowledge. Once we decide how we
     * want to handle `playlists` and content-management, we should move to
     * a more performant way of managing queries.
     */
    constructor(
        playlist: Playlist,
        allAudioItems: AudioItem[],
        allMediaItems: MediaItem[],
        allContributors: CoscradContributor[],
        baseUrl: string
    ) {
        super(playlist, allContributors);

        const { name, items } = playlist;

        this.name = name.clone();

        const allResourceCompositeIdsToFind = items.flatMap(
            ({ resourceCompositeIdentifier }) => resourceCompositeIdentifier
        );

        // TODO establish a view model for episodes
        const allResources = allAudioItems.filter(({ id }) =>
            allResourceCompositeIdsToFind.some((compositeId) => compositeId.id === id)
        );

        // note that the client has to append the base URL
        this.episodes = allResources.flatMap((resource) =>
            resource.buildEpisodes(
                new DeluxeInMemoryStore({
                    [ResourceType.mediaItem]: allMediaItems,
                }).fetchFullSnapshotInLegacyFormat(),
                baseUrl
            )
        );
    }
}
