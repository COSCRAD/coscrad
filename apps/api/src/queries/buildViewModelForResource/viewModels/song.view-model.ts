import { ISongViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, URL } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
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

    @FromSong
    readonly lengthMilliseconds: number;

    @FromSong
    readonly startMilliseconds: number;

    constructor(song: Song) {
        super(song);

        const { lyrics, audioURL, lengthMilliseconds, startMilliseconds } = song;

        if (!isNullOrUndefined(lyrics)) this.lyrics = new MultilingualText(lyrics);

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }
}
