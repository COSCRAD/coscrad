import { NonEmptyString, URL } from '@coscrad/data-types';

export class ExternalLink {
    @URL({
        label: 'url',
        description: 'url for the External link',
    })
    url: string;

    @URL({
        label: 'icon url',
        description: 'url for the External link icon',
    })
    iconUrl: string;

    @NonEmptyString({
        label: 'description',
        description: 'description for the External link',
    })
    description: string;
}
