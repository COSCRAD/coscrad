import { FromDomainModel, NonEmptyString, URL } from '@coscrad/data-types';
import { Song } from '../../../domain/models/song/song.entity';
import formatContributorAndRole from '../../presentation/formatContributorAndRole';
import { BaseViewModel } from './base.view-model';

const FromSong = FromDomainModel(Song);

export class SongViewModel extends BaseViewModel {
    @FromSong
    readonly title?: string;

    @FromSong
    readonly titleEnglish?: string;

    @NonEmptyString({ isArray: true })
    readonly contributions: string[];

    @FromSong
    readonly lyrics?: string;

    @URL()
    readonly audioURL: string;

    @FromSong
    readonly lengthMilliseconds: number;

    @FromSong
    readonly startMilliseconds: number;

    constructor({
        id,
        title,
        titleEnglish,
        contributions: contributorAndRoles,
        lyrics,
        audioURL,
        lengthMilliseconds,
        startMilliseconds,
    }: Song) {
        super({ id });

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributions = contributorAndRoles.map(formatContributorAndRole);

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }
}
