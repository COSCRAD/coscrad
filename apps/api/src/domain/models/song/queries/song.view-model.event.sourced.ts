import { FromDomainModel, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { isNonEmptyObject, isNonEmptyString } from '@coscrad/validation-constraints';
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
    },
})
export class EventSourcedSongViewModel {
    // TODO share these props with other resource views
    id: string;
    name: MultilingualText;
    isPublished: boolean;
    accessControlList: AccessControlList;
    contributions: ContributionSummary[];

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

        this.accessControlList = isNonEmptyString(accessControlList)
            ? new AccessControlList(accessControlList)
            : new AccessControlList();
    }

    static fromSongCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            title,
            languageCodeForTitle,
            // TODO use this
            audioItemId: _audioItemId,
        },
    }: SongCreated) {
        return new EventSourcedSongViewModel({
            id,
            name: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            // TODO join this in the query service layer
            audioURL: '',
            isPublished: false,
            accessControlList: new AccessControlList(),
            contributions: [],
            // TODO join in media info
            lengthMilliseconds: 0,
        });
    }

    public static fromDto(dto: DTO<EventSourcedSongViewModel>) {
        return new EventSourcedSongViewModel(dto);
    }
}
