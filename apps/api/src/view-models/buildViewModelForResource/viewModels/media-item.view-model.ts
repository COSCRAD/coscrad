import { FromDomainModel, MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { ContributorAndRole } from '../../../domain/models/song/ContributorAndRole';
import { BaseViewModel } from './base.view-model';

export class MediaItemViewModel extends BaseViewModel {
    @FromDomainModel(MediaItem)
    readonly title: string;

    @FromDomainModel(MediaItem)
    readonly titleEnglish: string;

    @FromDomainModel(MediaItem)
    readonly contributorAndRoles: ContributorAndRole[];

    @FromDomainModel(MediaItem)
    readonly url: string;

    @FromDomainModel(MediaItem)
    readonly mimeType: MIMEType;

    @FromDomainModel(MediaItem)
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
