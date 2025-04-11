import { AggregateType } from '@coscrad/api-interfaces';
import {
    ExternalEnum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateId } from '../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';

// TODO move this file
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

    constructor(dto: DTO<PlaylistEpisodeViewModel>) {
        if (!dto) return;

        const { name, mimeType, lengthMilliseconds, mediaItemId } = dto;

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;

        this.mediaItemId = mediaItemId;
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
        name: buildMultilingualTextWithSingleItem('Metal Mondays'),
        episodes: [],
    },
})
export class PlaylistViewModel {
    @UUID({
        label: 'Playlist ID',
        description: 'unique system-wide identifier for this playlist',
    })
    id: AggregateId;

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
        name?: MultilingualText,
        episodes: PlaylistEpisodeViewModel[] = []
    ) {
        this.id = id;

        if (isNonEmptyObject(name)) {
            // TODO Whose job is it to clone?
            this.name = name;
        }

        this.episodes = episodes;
    }

    public static fromDto(dto: DTO<PlaylistViewModel>): PlaylistViewModel {
        if (!isNonEmptyObject(dto)) {
            return new PlaylistViewModel();
        }

        const { id, name, episodes } = dto;

        return new PlaylistViewModel(
            id,
            new MultilingualText(name),
            episodes.map((e) => new PlaylistEpisodeViewModel(e))
        );
    }
}
