import { NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';

export class ExternalLink {
    @URL({
        label: 'title',
        description: 'title for the External link icon',
    })
    title: string;

    @URL({
        label: 'url',
        description: 'url for the External link',
    })
    url: string;

    @NonEmptyString({
        label: 'description',
        description: 'description for the External link',
    })
    description: string;

    constructor(dto: DTO<ExternalLink>) {
        if (!dto) return;

        const { title, url, description } = dto;

        this.title = title;

        this.url = url;

        this.description = description;
    }
}
