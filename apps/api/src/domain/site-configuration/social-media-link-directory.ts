import { URL } from '@coscrad/data-types';

export class SocialMediaLinkDirectory {
    @URL({
        label: 'facebook url',
        description: 'url for FaceBook feed',
    })
    facebook: string;

    @URL({
        label: 'twitter url',
        description: 'url for Twitter feed',
    })
    twitter: string;

    @URL({
        label: 'github url',
        description: 'url for GitHub site',
    })
    github: string;

    @URL({
        label: 'youtube url',
        description: 'url for Youtube feed',
    })
    youtube: string;

    @URL({
        label: 'instagram url',
        description: 'url for Instagram feed',
    })
    instagram: string;
}
