import { CategorizableType } from '@coscrad/api-interfaces';
import { ConfigurableContent, DetailViewType } from './configurable-content-schema';

export const contentConfig: ConfigurableContent = {
    siteTitle: 'Site Title',
    subTitle: 'Site Subtitle',
    about: 'Add a few sentences about your web of knowledge!',
    siteDescription: 'Your site decription goes here..',
    siteHomeImageUrl: 'https://www.picbox.org/home-image.png',
    copyrightHolder: 'My Organization',
    coscradLogoUrl: 'https://www.picbox.org/coscrad-logo.png',
    organizationLogoUrl: 'https://www.picbox.org/org-logo.png',
    songIdToCredits: {
        '1': 'Credits for song 1',
    },
    videoIdToCredits: {
        '2': 'Credits for video 2',
    },
    indexToDetailFlows: Object.values(CategorizableType)
        .filter(
            (t): t is Exclude<CategorizableType, typeof CategorizableType.playlist> =>
                t !== CategorizableType.playlist
        )
        .map((categorizableType) => ({
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
    listenLive: {
        title: 'Web Radio Stream',
        route: 'Live',
        label: '89.5',
        logoUrl: 'https://www.mymams.org/logo.jpg',
        iceCastLink: 'https://www.somebroadcaster.com/link',
        playingMessage: 'Now Playing',
        missionStatement: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        ].join(' '),
    },
    termOfTheDayConfig: {
        '01': '123',
        '02': '124',
        '03': '125',
        '04': '126',
        '05': '127',
        '06': '128',
        '07': '129',
        '08': '130',
        '09': '131',
        '10': '132',
        '11': '133',
        '12': '134',
        '13': '135',
        '14': '136',
        '15': '137',
        '16': '138',
        '17': '139',
        '18': '140',
        '19': '141',
        '20': '142',
        '21': '143',
        '22': '144',
        '23': '145',
        '24': '146',
        '25': '147',
        '26': '148',
        '27': '149',
        '28': '150',
        '29': '151',
        '30': '152',
        '31': '153',
    },
    notFoundMessage: 'No result found.',
};
