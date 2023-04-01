// ***********************************************

import { CategorizableType } from '@coscrad/api-interfaces';

const configPath = 'test.json';

const dummyConfig = {
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
    indexToDetailFlows: Object.values(CategorizableType).map((categorizableType) => ({
        categorizableType,
        detailViewType: 'full-view',
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
};

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        login(email: string, password: string): void;

        overwriteConfig(config: Record<string, unknown>): void;

        restoreConfig(): Promise<void>;
    }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
    console.log('Custom command example: Login', email, password);
});

Cypress.Commands.add('overwriteConfig', (overrides: Record<string, unknown>) => {
    cy.readFile(configPath).then((_data) => {
        cy.writeFile(configPath, {
            ...dummyConfig,
            ...overrides,
        });
    });
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
