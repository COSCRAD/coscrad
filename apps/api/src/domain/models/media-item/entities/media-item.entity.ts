import { DTO } from 'apps/api/src/types/DTO';
import { resourceTypes } from '../../../types/resourceTypes';
import { Resource } from '../../resource.entity';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { MIMEType } from '../types/MIMETypes';

export class MediaItem extends Resource {
    readonly type = resourceTypes.mediaItem;

    readonly title?: string;

    readonly titleEnglish?: string;

    readonly contributorAndRoles: ContributorAndRole[];

    readonly url: string;

    readonly mimeType: MIMEType;

    constructor(dto: DTO<MediaItem>) {
        super(dto);

        const { title, titleEnglish, contributorAndRoles, url, mimeType } = dto;

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributorAndRoles = contributorAndRoles.map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.url = url;

        this.mimeType = mimeType;
    }
}
