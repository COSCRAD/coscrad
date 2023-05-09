import { ISongViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, URL } from '@coscrad/data-types';
import { Song } from '../../../domain/models/song/song.entity';
import { BaseViewModel } from './base.view-model';

const FromSong = FromDomainModel(Song);

export class SongViewModel extends BaseViewModel implements ISongViewModel {
    @FromSong
    readonly lyrics?: string;

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

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }
}
