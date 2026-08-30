import { CategorizableType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { SimulatedKeyboard } from '../../../../lib/nlp/types/simulated-keyboard';
import { CoscradDataExample } from '../../../../test-data/utilities';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { SocialMediaLinkDirectory } from '../../social-media-link-directory';
import { ThemeOverrides } from '../../theme-overrides';
import { AdditionalMaterial } from '../additional-material';
import { AlphabetConfig } from '../alphabet-config';
import { ExternalLink } from '../external-link';
import { InternalLink } from '../internal-link';
import { LanguageHubConfig } from '../language-hub-config';
import { MemoryMatchConfig } from '../memory-match-config';
import { RadioStreamConfig } from '../radio-stream-config';
import { DetailViewType, ResourceConfig } from '../resource-config';

@CoscradDataExample<LanguageHubConfig>({
    example: {
        id: buildDummyUuid(2),
        name: 'COSCRAD Sandbox Configuration',
        siteTitle: 'COSCRAD [~Sandbox~]',
        subTitle: 'Powering a Web of Knowledge',
        about: 'Welcome to the official COSCRAD sandbox!',
        shouldEnableAdminMode: true,
        siteDescription: 'Here you can test drive our toy intance of the COSCRAD platform',
        siteHomeImageUrl: 'https://coscrad.org/wp-content/uploads/2023/05/earth-3537401_1920.jpg',
        siteFavicon: 'https://www.tsilhqotin.ca/wp-content/uploads/2023/06/tng_logo.png',
        copyrightHolder: 'COSCRAD',
        coscradLogoUrl:
            'https://coscrad.org/wp-content/uploads/2023/05/COSCRAD-logo-prototype-1.png',
        organizationLogoUrl:
            'https://coscrad.org/wp-content/uploads/2023/05/Coscrad-alt-logo-prototype.png',
        indexToDetailFlows: Object.values(CategorizableType)
            .filter((t) => t !== CategorizableType.playlist)
            .map((categorizableType) => ({
                categorizableType,
                detailViewType: DetailViewType.fullView,
            })),
        shouldEnableWebOfKnowledgeForResources: true,
        siteCredits: 'Credits here',
        // TODO Move this to the database \ back-end and enable it here by language code
        // TODO Decide how this connects to the `alphabet`
        simulatedKeyboard: {
            name: 'Tŝilhqot’in',
            specialCharacterReplacements: {
                // Note that these can also be represented as `C + '\u0302'` (UTF16: 0x0302)
                's[': String.fromCodePoint(0x015d),
                'S[': String.fromCodePoint(0x015c),
                'w[': String.fromCodePoint(0x0175),
                'W[': String.fromCodePoint(0x0174),
                'z[': String.fromCodePoint(0x1e91),
                'Z[': String.fromCodePoint(0x1e90),
                // These have only a single code point representation
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
        notFoundMessage: 'No result found.',
        loadingMessage: 'Loading',
        themeOverrides: {
            palette: {
                primary: {
                    light: '#FF7B6E',
                    main: '#a8a552',
                    dark: '#A40011',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    light: '#000000',
                    main: '#000000',
                    dark: '#000000',
                    contrastText: '#FFFFFF',
                },
                text: {
                    primary: '#212121',
                    secondary: '#757575',
                    disabled: '#BDBDBD',
                },
                background: {
                    paper: '#F5F5F5',
                },
                action: {
                    hover: '#FFFF00',
                    active: '#A40011',
                    hoverOpacity: 0.08,
                    selected: '#E0E0E0',
                    selectedOpacity: 0.16,
                    disabled: '#BDBDBD',
                    disabledBackground: '#E0E0E0',
                    disabledOpacity: 0.38,
                    focus: '#FFFF00',
                    focusOpacity: 0.12,
                    activatedOpacity: 0.24,
                },
            },
        },
        resourceIndexLabel: 'Available Resources',
        defaultLanguageCode: LanguageCode.Chilcotin,
        phoneNumber: '1-{234} 567-8901',
        email: 'contact@emailserver.com',
        address: 'Somewhere Drive, Sanctuary , NA',
        internalLinks: [
            {
                url: 'www.coscrad.org',
                iconUrl:
                    'https://coscrad.org/wp-content/uploads/2023/05/COSCRAD-logo-prototype-1.png',
                description: 'Coscrad',
            },
        ],
        externalLinks: [
            {
                title: 'Language Hub',
                url: 'https://www.tsilhqotinlanguage.ca',
                description: 'This is a cool website.',
            },
        ],
        socialMediaLinks: {
            facebook: 'https://www.facebook.com/',
            twitter: 'https://twitter.com/',
            github: 'https://github.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
        },
        alphabetConfig: {
            shouldEnableAlphabet: true,
            alphabetChartName: 'alphabet',
            baseDigitalAssetUrl: 'https://www.mediafortests.com/api',
        },
        additionalMaterials: [
            {
                media: {
                    name: 'my featured song',
                    url: 'www.songs.com/123.mp3',
                    description: 'I want to show this off ASAP',
                    mimeType: MIMEType.mp3,
                },
                pdf: {
                    name: 'lyrics pdf',
                    description: 'this has the lyrics, written by Willy Workhard',
                    url: 'www.mysite.com/mytext.pdf',
                },
            },
        ],
        memoryMatch: {
            isEnabled: true,
        },
    },
})
export class SiteConfigCreationDto {
    name: string;
    siteTitle: string;
    subTitle: string;
    about: string;
    shouldEnableAdminMode: boolean;
    siteDescription: string;
    siteHomeImageUrl: string;
    siteFavicon: string;
    copyrightHolder: string;
    coscradLogoUrl: string;
    indexToDetailFlows: ResourceConfig[];
    resourceIndexLabel: string;
    shouldEnableWebOfKnowledgeForResources: boolean;
    siteCredits: string;
    simulatedKeyboard: SimulatedKeyboard;
    listenLive: RadioStreamConfig;
    notFoundMessage: string;
    loadingMessage: string;
    themeOverrides: ThemeOverrides;
    defaultLanguageCode: LanguageCode;
    phoneNumber: string;
    email: string;
    address: string;
    internalLinks: InternalLink[];
    externalLinks: ExternalLink[];
    socialMediaLinks: SocialMediaLinkDirectory;
    alphabetConfig: AlphabetConfig;
    additionalMaterials: AdditionalMaterial[];
    memoryMatch: MemoryMatchConfig;
}
