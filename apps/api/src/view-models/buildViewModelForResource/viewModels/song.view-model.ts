import { Song } from '../../../domain/models/song/song.entity';
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

        this.contributions = contributorAndRoles.map(
            ({ contributorId, role }) => `${contributorId} (${role})`
        );

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }
}
