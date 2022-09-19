import { FromDomainModel, NonEmptyString, URL } from '@coscrad/data-types';
import { Song } from '../../../domain/models/song/song.entity';
import formatContributorAndRole from '../../presentation/formatContributorAndRole';
import { BaseViewModel } from './base.view-model';

export class SongViewModel extends BaseViewModel {
    @FromDomainModel(Song)
    readonly title?: string;

    @FromDomainModel(Song)
    readonly titleEnglish?: string;

    @NonEmptyString({ isArray: true })
    readonly contributions: string[];

    @FromDomainModel(Song)
    readonly lyrics?: string;

    @URL()
    readonly audioURL: string;

    @FromDomainModel(Song)
    readonly lengthMilliseconds: number;

    @FromDomainModel(Song)
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
