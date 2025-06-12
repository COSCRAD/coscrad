import { AggregateType, IPlaylistEpisode, ResourceType } from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    NestedDataType,
    NonEmptyString,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../../domain/models/user-management/contributor/views';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { ConnectionRecordForResourceViewModel } from './connection-record-for-resource.view-model';
import { NoteRecordForResourceViewModel } from './note-record-for-resource.view-model';
import { EventSourcedTagRecordForResourceViewModel } from './tag.view-model.event-sourced';

// TODO move this file

@CoscradDataExample<PlaylistEpisodeViewModel>({
    example: {
        name: buildMultilingualTextWithSingleItem('Episode 1'),
        isPublished: false,
        accessControlList: new AccessControlList(),
        mediaItemId: buildDummyUuid(567),
    },
})
export class PlaylistEpisodeViewModel {
    // resourceCompositeIdentifier

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name of this episode along with its translations',
    })
    name: MultilingualText;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID',
        description: 'system reference to the media item for this episode',
    })
    mediaItemId: AggregateId;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this playlist is available to the general public',
    })
    // TODO move this to the ACL below
    isPublished: boolean;

    // this is removed in query responses
    accessControlList: AccessControlList;

    constructor(dto: DTO<PlaylistEpisodeViewModel>) {
        if (!dto) return;

        const { name, mediaItemId, accessControlList, isPublished } = dto;

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = isNonEmptyObject(accessControlList)
            ? new AccessControlList(accessControlList)
            : new AccessControlList();

        this.mediaItemId = mediaItemId;
    }

    public canUserWithGroups(userWithGroups?: CoscradUserWithGroups): boolean {
        if (!isNonEmptyObject(userWithGroups)) {
            return this.isPublished;
        }

        return this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups);
    }

    public static fromDto(dto: DTO<PlaylistEpisodeViewModel>): PlaylistEpisodeViewModel {
        return new PlaylistEpisodeViewModel(dto);
    }
}

/**
 * Note that in the future we anticipate the Playlist becoming something other
 * than a resource. This may be a "report" or a "user defined view". It is really
 * a configured custom view of multiple resources.
 *
 * As such, we do not want to encourage making many web of knowledge connections
 * or notes about the playlist and will only support general context in connections
 * for playlists.
 */
// TODO leverage this in `buildTestData`
@CoscradDataExample<PlaylistViewModel>({
    example: {
        type: ResourceType.playlist,
        id: buildDummyUuid(9001),
        isPublished: false,
        name: buildMultilingualTextWithSingleItem('Metal Mondays'),
        episodes: [],
        contributions: [],
        tags: [],
        accessControlList: new AccessControlList(),
        notes: [],
        connections: [],
    },
})
export class PlaylistViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    // extends BaseEventSourcedResourceViewModel {
    type: ResourceType = ResourceType.playlist;

    /**
     * TODO extend base
     */

    @UUID({
        label: 'id',
        description: 'system identifier for this resource',
    })
    id: AggregateId;

    @NestedDataType(MultilingualText, {
        label: 'name',
        // note that we call it `name` not `text` for consistency with other models
        description: 'name (text) includes the text as well as any translations for this term',
    })
    name: MultilingualText;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource available to the public',
    })
    isPublished: boolean;

    accessControlList: AccessControlList;

    // TODO add notes

    @NestedDataType(ContributionSummary, {
        label: 'contributions',
        description: 'a list of all contributions to the development of this resource',
        // Can't we get this from reflection?
        isArray: true,
    })
    contributions: ContributionSummary[];

    @NestedDataType(EventSourcedTagRecordForResourceViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagRecordForResourceViewModel[];

    @NestedDataType(NoteRecordForResourceViewModel, {
        label: 'notes',
        description: 'a list of contextualized notes about this resource',
        isArray: true,
    })
    notes: NoteRecordForResourceViewModel[];
    // end TODO extend base

    @NestedDataType(ConnectionRecordForResourceViewModel, {
        label: 'connections',
        description: 'a list of contextualized connections to other resources about with a note',
        isArray: true,
    })
    connections: ConnectionRecordForResourceViewModel[];

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
    // TODO move this class here
    episodes: PlaylistEpisodeViewModel[];

    /**
     * TODO This is not a performant way to handle joins. We have moved to
     * event sourcing most resources, however playlists are somewhat unique in
     * being more closely alligned with CMS concerns than constituting an
     * actual resource in the web of knowledge. Once we decide how we
     * want to handle `playlists` and content-management, we should move to
     * a more performant way of managing queries.
     */
    constructor(dto: DTO<PlaylistViewModel>) {
        // TODO extend base
        // super(dto);
        const {
            contributions,
            name,
            id,
            accessControlList,
            tags,
            isPublished,
            notes,
            connections,
        } = dto;

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = new AccessControlList(accessControlList);

        this.tags = Array.isArray(tags)
            ? tags.map((t) => new EventSourcedTagRecordForResourceViewModel(t))
            : [];

        if (Array.isArray(notes))
            this.notes = notes.map((n) => NoteRecordForResourceViewModel.fromDto(n));
        // end TODO extend base

        if (Array.isArray(connections))
            this.connections = connections.map((n) =>
                ConnectionRecordForResourceViewModel.fromDto(n)
            );

        if (!dto) return;

        const { episodes = [] } = dto;

        this.episodes = episodes.map((e) => new PlaylistEpisodeViewModel(e));
    }

    public getCompositeIdentifier() {
        return {
            type: AggregateType.playlist,
            id: this.id,
        };
    }

    public getAvailableCommands(): string[] {
        const allActions = [
            'CREATE_NOTE_ABOUT_RESOURCE',
            'PUBLISH_RESOURCE',
            'TAG_RESOURCE_OR_NOTE',
        ];

        // TODO `isPublished`

        return allActions;
    }

    public forUser(userWithGroups?: CoscradUserWithGroups): Maybe<
        Omit<PlaylistViewModel, 'queryAccessControlList' | 'episodes'> & {
            episodes: Omit<PlaylistEpisodeViewModel, 'accessControlList'>[];
        }
    > {
        const buildResult = (): PlaylistViewModel => {
            const availableEpisodes = this.episodes.flatMap((e) => {
                // TODO we need an event consumer that publishes playlist items
                // if (!e.canUserWithGroups(userWithGroups)) {
                //     return [];
                // }

                delete e.accessControlList;

                return [e];
            });

            this.episodes = availableEpisodes;

            return this;
        };

        /**
         * TODO We should really
         * 1. Inject an public user with no groups for public requests
         * 2. Move `isPublished` to the `ACL` spec
         */
        if (!isNonEmptyObject(userWithGroups)) {
            if (!this.isPublished) {
                return NotFound;
            }

            const result = buildResult();

            // @ts-expect-error remove read-only
            result.episodes = result.episodes.map((e) => {
                delete e.accessControlList;

                return e as unknown as IPlaylistEpisode;
            });

            return result as unknown as Omit<
                PlaylistViewModel,
                'queryAccessControlList' | 'episodes'
            > & {
                episodes: Omit<PlaylistEpisodeViewModel, 'accessControlList'>[];
            };
        }

        if (this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups)) {
            const result = buildResult();

            // delete result.accessControlList;

            // @ts-expect-error remove read-only
            result.episodes = result.episodes.map((e) => {
                delete e.accessControlList;

                return e as unknown as IPlaylistEpisode;
            });

            return result as unknown as Omit<
                PlaylistViewModel,
                'queryAccessControlList' | 'episodes'
            > & {
                episodes: Omit<PlaylistEpisodeViewModel, 'accessControlList'>[];
            };
        }

        return NotFound;
    }

    public static fromDto(dto: DTO<PlaylistViewModel>): PlaylistViewModel {
        return new PlaylistViewModel(dto);
    }
}
