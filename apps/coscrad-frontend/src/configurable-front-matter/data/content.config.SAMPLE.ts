import { CategorizableType } from '@coscrad/api-interfaces';
import { ConfigurableContent, DetailViewType } from './configurable-content-schema';

export const contentConfig: ConfigurableContent = {
    siteTitle: 'Site Title',
    subTitle: 'Site Subtitle',
    about: 'Add a few sentences about your web of knowledge!',
    siteDescription: 'Your site decription goes here..',
    siteHomeImageUrl: 'https://www.picbox.org/home-image.png',
    copyrightHolder: 'My Organization',
    organizationLogoUrl: 'https://www.picbox.org/logo.png',
    songIdToCredits: {
        '1': 'Credits for song 1',
    },
    videoIdToCredits: {
        '2': 'Credits for video 2',
    },
    indexToDetailFlows: Object.values(CategorizableType).map((categorizableType) => ({
        categorizableType,
        detailViewType: DetailViewType.fullView,
    })),
    shouldEnableWebOfKnowledgeForResources: true,
    siteCredits: 'Credits here',
    simulatedKeyboard: {
        name: 'Tŝilhqot’in',
        specialCharacterReplacements: {
            's[': 'ŝ',
            'w[': 'ŵ',
            'z[': 'ẑ',
            ']': 'ʔ',
            ';': 'ɨ',
            "'": '’',
        },
    },
};
