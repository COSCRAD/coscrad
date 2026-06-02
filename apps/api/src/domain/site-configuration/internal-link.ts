import { NonEmptyString, URL } from '@coscrad/data-types';

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
}
