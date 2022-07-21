import { Song } from '../../../domain/models/song/song.entity';
import formatContributorAndRole from '../../presentation/formatContributorAndRole';
import { BaseViewModel } from './base.view-model';

export class SongViewModel extends BaseViewModel {
    readonly title?: string;

    readonly titleEnglish?: string;

    readonly contributions: string[];

    readonly lyrics?: string;

    readonly audioURL: string;

    readonly lengthMilliseconds: number;

    readonly startMilliseconds: number;

    constructor({
        id,
        title,
        titleEnglish,
        contributorAndRoles,
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
