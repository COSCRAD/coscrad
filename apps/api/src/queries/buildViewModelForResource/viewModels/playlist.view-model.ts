import { AggregateType, IPlaylistEpisode } from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    ExternalEnum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../../domain/models/user-management';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';

// TODO move this file

// TODO move this to another file DO this
@CoscradDataExample<PlaylistEpisodeViewModel>({
    example: {
        name: buildMultilingualTextWithSingleItem('Episode 1'),
        isPublished: false,
        accessControlList: new AccessControlList(),
        mimeType: MIMEType.mp3,
        mediaItemId: buildDummyUuid(567),
        lengthMilliseconds: 30456,
    },
})
export class PlaylistEpisodeViewModel {
    // resourceCompositeIdentifier

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name of this episode along with its translations',
    })
    name: MultilingualText;

    @ExternalEnum(
        {
            labelsAndValues: Object.entries(MIMEType).map(([label, value]) => ({ label, value })),
            enumLabel: 'MIME type',
            enumName: 'MIMEType',
        },
        {
            label: 'MIME type',
            description: 'technical specification of the format of the media item',
        }
    )
    mimeType: MIMEType;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID',
        description: 'system reference to the media item for this episode',
    })
    mediaItemId: AggregateId;

    @NonNegativeFiniteNumber({
        label: 'duration (ms)',
        description: 'duration of the audio or video in milliseconds',
    })
    lengthMilliseconds: number;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this playlist is available to the general public',
    })
    // TODO move this to the ACL below
    isPublished: boolean;

    @NestedDataType(AccessControlList, {
        label: 'ACL',
        description: 'the access control list indicates which users and groups can view episodes',
    })
    accessControlList: AccessControlList;

    constructor(dto: DTO<PlaylistEpisodeViewModel>) {
        if (!dto) return;

        const { name, mimeType, lengthMilliseconds, mediaItemId, accessControlList, isPublished } =
            dto;

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = isNonEmptyObject(accessControlList)
            ? new AccessControlList(accessControlList)
            : new AccessControlList();

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;

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
        id: buildDummyUuid(9001),
        queryAccessControlList: new AccessControlList(),
        isPublished: false,
        name: buildMultilingualTextWithSingleItem('Metal Mondays'),
        episodes: [],
        contributions: [],
    },
})
export class PlaylistViewModel {
    @UUID({
        label: 'Playlist ID',
        description: 'unique system-wide identifier for this playlist',
    })
    id: AggregateId;

    @BooleanDataType({
        label: 'is published',
        description: 'a flag indicating whether this playlist is published',
    })
    isPublished: boolean;

    @NestedDataType(ContributionSummary, {
        isArray: true,
        label: 'contributions',
        description: 'a summary of the work done by various contributors in creating this playlist',
    })
    contributions: ContributionSummary[];

    @NestedDataType(AccessControlList, {
        label: 'query ACL',
        description:
            'the access control list determines which users and groups can see this playlist',
    })
    queryAccessControlList: AccessControlList;

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
    // TODO move this class here
    readonly episodes: PlaylistEpisodeViewModel[];

    /**
     * TODO This is not a performant way to handle joins. We have moved to
     * event sourcing most resources, however playlists are somewhat unique in
     * being more closely alligned with CMS concerns than constituting an
     * actual resource in the web of knowledge. Once we decide how we
     * want to handle `playlists` and content-management, we should move to
     * a more performant way of managing queries.
     */
    constructor(
        id?: AggregateId,
        isPublished?: boolean,
        accessControlList?: AccessControlList,
        name?: MultilingualText,
        episodes: PlaylistEpisodeViewModel[] = [],
        contributions: ContributionSummary[] = []
    ) {
        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.queryAccessControlList = isNonEmptyObject(accessControlList)
            ? new AccessControlList(accessControlList)
            : // no special access
              new AccessControlList();

        if (isNonEmptyObject(name)) {
            // TODO Whose job is it to clone?
            this.name = name;
        }

        this.episodes = episodes;

        this.contributions = contributions;
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
                if (!e.canUserWithGroups(userWithGroups)) {
                    return [];
                }

                delete e.accessControlList;

                return [e];
            });

            // @ts-expect-error should we remove read only?
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

            delete result.queryAccessControlList;

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

        if (this.isPublished || this.queryAccessControlList.canUserWithGroups(userWithGroups)) {
            const result = buildResult();

            delete result.queryAccessControlList;

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

    public static fromDto(
        dto: DTO<Omit<PlaylistViewModel, 'contributions'>> & {
            contributions?: ContributionSummary[];
        }
    ): PlaylistViewModel {
        if (!isNonEmptyObject(dto)) {
            return new PlaylistViewModel();
        }

        const { id, name, episodes, isPublished, queryAccessControlList, contributions } = dto;

        return new PlaylistViewModel(
            id,
            isPublished,
            new AccessControlList(queryAccessControlList),
            new MultilingualText(name),
            episodes.map((e) => new PlaylistEpisodeViewModel(e)),
            contributions
        );
    }
}
