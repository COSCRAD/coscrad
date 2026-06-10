import { URL } from '@coscrad/data-types';
import { DTO } from '../../types/DTO';

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

    constructor(dto: DTO<SocialMediaLinkDirectory>) {
        if (!dto) return;

        const { facebook, twitter, github, youtube, instagram } = dto;

        this.facebook = facebook;

        this.twitter = twitter;

        this.github = github;

        this.youtube = youtube;

        this.instagram = instagram;
    }
}
