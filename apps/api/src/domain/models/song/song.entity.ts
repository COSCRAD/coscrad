import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { resourceTypes } from '../../types/resourceTypes';
import { Resource } from '../resource.entity';

type ContributorAndRole = {
    contributorId: string;
    role: string;
};

export class Song extends Resource {
    readonly type = resourceTypes.song;

    readonly title?: string;

    readonly titleEnglish?: string;

    readonly contributorAndRoles: ContributorAndRole[];

    readonly lyrics?: string; // lyric type - should allow three way translation in future

    readonly audioURL: string;

    constructor(dto: DTO<Song>) {
        super({ ...dto, type: resourceTypes.song });

        const { title, titleEnglish, contributorAndRoles, lyrics, audioURL } = dto;

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributorAndRoles = cloneToPlainObject(contributorAndRoles);

        this.lyrics = lyrics;

        this.audioURL = audioURL;
    }
}
