import { FromDomainModel, MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { ContributorAndRole } from '../../../domain/models/song/ContributorAndRole';
import { BaseViewModel } from './base.view-model';

const FromMediaItem = FromDomainModel(MediaItem);

export class MediaItemViewModel extends BaseViewModel {
    @FromMediaItem
    readonly title: string;

    @FromMediaItem
    readonly titleEnglish: string;

    @FromMediaItem
    readonly contributorAndRoles: ContributorAndRole[];

    @FromMediaItem
    readonly url: string;

    @FromMediaItem
    readonly mimeType: MIMEType;

    @FromMediaItem
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
