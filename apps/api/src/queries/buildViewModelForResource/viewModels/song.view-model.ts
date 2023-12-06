import { ISongViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { AudioItem } from '../../../domain/models/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { Song } from '../../../domain/models/song/song.entity';
import { BaseViewModel } from './base.view-model';

const FromSong = FromDomainModel(Song);

export class SongViewModel extends BaseViewModel implements ISongViewModel {
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

    constructor(song: Song, audioItems: AudioItem[], mediaItems: MediaItem[]) {
        super(song);

        const { lyrics, audioItemId } = song;

        const audioItemSearchResult = audioItems.find(({ id }) => id === audioItemId);

        const mediaItemSearchResult = audioItemSearchResult
            ? mediaItems.find(({ id }) => audioItemSearchResult.mediaItemId === id)
            : undefined;

        const url = mediaItemSearchResult?.url;

        if (!isNullOrUndefined(lyrics)) this.lyrics = new MultilingualText(lyrics);

        this.audioURL = url;

        this.lengthMilliseconds = mediaItemSearchResult?.lengthMilliseconds;
    }
}
