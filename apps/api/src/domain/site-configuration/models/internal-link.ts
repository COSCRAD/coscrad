import { NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';

export class InternalLink {
    @URL({
        label: 'url',
        description: 'url for the internal link',
    })
    url: string;

    @URL({
        label: 'icon url',
        description: 'url for the internal link icon',
    })
    iconUrl: string;

    @NonEmptyString({
        label: 'description',
        description: 'description for the internal link',
    })
    description: string;

    constructor(dto: DTO<InternalLink>) {
        if (!dto) return;

        const { url, iconUrl, description } = dto;

        this.url = url;

        this.iconUrl = iconUrl;

        this.description = description;
    }
}
