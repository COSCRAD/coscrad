import { AggregateType } from '@coscrad/api-interfaces';
import { FromDomainModel, NonNegativeFiniteNumber, UUID } from '@coscrad/data-types';
import {
    isNonEmptyObject,
    isNonEmptyString,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { HasAggregateId } from '../../../types/HasAggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { SongCreated } from '../commands';
import { Song } from '../song.entity';

const FromSong = FromDomainModel(Song);

const testEventId = buildDummyUuid(1);

@CoscradDataExample<EventSourcedSongViewModel>({
    example: {
        id: testEventId,
        name: buildMultilingualTextWithSingleItem('test song'),
        isPublished: false,
        accessControlList: new AccessControlList(),
        contributions: [],
        lyrics: buildMultilingualTextWithSingleItem('lalala'),
        audioItemId: buildDummyUuid(50),
        mediaItemId: buildDummyUuid(49),
        lengthMilliseconds: 1500,
        notes: [],
        tags: [],
    },
})
export class EventSourcedSongViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    // TODO share these props with other resource views
    id: string;
    name: MultilingualText;
    isPublished: boolean;
    accessControlList: AccessControlList;
    contributions: ContributionSummary[];
    notes: NoteRecordForResourceViewModel[];
    tags: EventSourcedTagRecordForResourceViewModel[];

    @FromSong
    readonly lyrics?: MultilingualText;

    @UUID({
        label: 'song ID',
        description: 'system reference to the song for this song',
    })
    audioItemId: AggregateId;

    @UUID({
        label: 'media item ID',
        description: 'system reference to the media item for this song',
    })
    mediaItemId?: AggregateId;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: `length of the song's audio in milliseconds`,
    })
    readonly lengthMilliseconds: number;

    constructor(dto: DTO<EventSourcedSongViewModel>) {
        if (!dto) return;

        const {
            lyrics,
            audioItemId,
            mediaItemId,
            lengthMilliseconds,
            id,
            name,
            isPublished,
            accessControlList,
            notes,
            tags,
            contributions,
        } = dto;

        if (isNonEmptyObject(lyrics)) {
            this.lyrics = new MultilingualText(lyrics);
        }

        this.audioItemId = audioItemId;

        if (isNonEmptyString(mediaItemId)) {
            this.mediaItemId = mediaItemId;
        }

        this.lengthMilliseconds = lengthMilliseconds;

        this.id = id;

        this.isPublished = isPublished;

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => new ContributionSummary(c))
            : [];

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name);
        }

        this.accessControlList = isNonEmptyObject(accessControlList)
            ? new AccessControlList(accessControlList)
            : new AccessControlList();

        this.tags = Array.isArray(tags)
            ? tags.map((t) => new EventSourcedTagRecordForResourceViewModel(t))
            : [];

        if (Array.isArray(notes))
            this.notes = notes.map((n) => NoteRecordForResourceViewModel.fromDto(n));
    }

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        return {
            type: AggregateType.song,
            id: this.id,
        };
    }

    getAvailableCommands(): string[] {
        // TODO expose Song command flow in the UX
        return [];
    }

    public forUser(
        userWithGroups?: CoscradUserWithGroups
    ): Maybe<Omit<EventSourcedSongViewModel, 'queryAccessControlList' | 'episodes'>> {
        // TODO find a way to share this logic
        if (isNullOrUndefined(userWithGroups)) {
            if (this.isPublished) {
                /**
                 * we may want to remove media item IDs, although the media query
                 * service will not return media in case the user has access to
                 * the audio item but not the raw media item.
                 */
                return this;
            }

            return NotFound;
        }

        if (this.isPublished) {
            return this;
        }

        if (!this.accessControlList.canUserWithGroups(userWithGroups)) {
            return NotFound;
        }

        return this;
    }

    static fromSongCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            title,
            languageCodeForTitle,
            audioItemId,
        },
    }: SongCreated) {
        return new EventSourcedSongViewModel({
            id,
            name: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            isPublished: false,
            accessControlList: new AccessControlList(),
            contributions: [],
            audioItemId,
            // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-76?atlOrigin=eyJpIjoiNjRhMTdkZmVlOWFiNDAxZThmZGZiYmViY2Y5ODE4MTUiLCJwIjoiaiJ9] join in media info
            lengthMilliseconds: 0,
            tags: [],
            notes: [],
        });
    }

    public static fromDto(dto: DTO<EventSourcedSongViewModel>) {
        return new EventSourcedSongViewModel(dto);
    }
}
