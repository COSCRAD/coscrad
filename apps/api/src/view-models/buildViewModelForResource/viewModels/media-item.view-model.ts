import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { MIMEType } from '../../../domain/models/media-item/types/MIMETypes';
import { ContributorAndRole } from '../../../domain/models/song/ContributorAndRole';
import { BaseViewModel } from './base.view-model';

export class MediaItemViewModel extends BaseViewModel {
    readonly title: string;

    readonly titleEnglish: string;

    readonly contributorAndRoles: ContributorAndRole[];

    readonly url: string;

    readonly mimeType: MIMEType;

    readonly lengthMilliseconds: number;

    constructor(mediaItem: MediaItem) {
        const { id, title, titleEnglish, contributorAndRoles, url, mimeType, lengthMilliseconds } =
            mediaItem;

        super({ id });

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributorAndRoles = contributorAndRoles.map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.url = url;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;
    }
}
