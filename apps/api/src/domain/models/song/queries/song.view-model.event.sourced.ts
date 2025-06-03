import { FromDomainModel, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../user-management';
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
        audioURL: 'https://www.coscrad.org/lalala.mp3',
        lengthMilliseconds: 1500,
        notes: [],
        tags: [],
    },
})
export class EventSourcedSongViewModel {
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

    @URL({
        label: 'audio link',
        description: 'a web link to the digital audio file for playback',
    })
    readonly audioURL: string;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: `length of the song's audio in milliseconds`,
    })
    readonly lengthMilliseconds: number;

    constructor(dto: DTO<EventSourcedSongViewModel>) {
        if (!dto) return;

        const {
            lyrics,
            audioURL,
            lengthMilliseconds,
            id,
            name,
            isPublished,
            accessControlList,
            notes,
            tags,
            // let's be sure we do this now
            // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-76?atlOrigin=eyJpIjoiNjRhMTdkZmVlOWFiNDAxZThmZGZiYmViY2Y5ODE4MTUiLCJwIjoiaiJ9] support this in the query service
            // contributions,
        } = dto;

        if (isNonEmptyObject(lyrics)) {
            this.lyrics = new MultilingualText(lyrics);
        }

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.id = id;

        this.isPublished = isPublished;

        // TODO add this
        this.contributions = [];

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

    static fromSongCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            title,
            languageCodeForTitle,
            // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-76?atlOrigin=eyJpIjoiNjRhMTdkZmVlOWFiNDAxZThmZGZiYmViY2Y5ODE4MTUiLCJwIjoiaiJ9] use this
            audioItemId: _audioItemId,
        },
    }: SongCreated) {
        return new EventSourcedSongViewModel({
            id,
            name: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-76?atlOrigin=eyJpIjoiNjRhMTdkZmVlOWFiNDAxZThmZGZiYmViY2Y5ODE4MTUiLCJwIjoiaiJ9] join this in the query service layer
            audioURL: '',
            isPublished: false,
            accessControlList: new AccessControlList(),
            contributions: [],
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
