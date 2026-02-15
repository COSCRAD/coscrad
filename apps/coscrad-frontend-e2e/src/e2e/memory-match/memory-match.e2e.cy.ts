import {
    IMemoryMatchCard,
    IMemoryMatchRound,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { buildDummyUuid } from '../../support/utilities';

const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

const testMediaItemPrefix = 'cypress-memory-match-';

const baseMediaUrl = 'http://localhost:3131/api/resources/media-items/download?name=';

const buildMediaItemUrl = (name: string) => `${baseMediaUrl}${name}`;

const buildMemoryCard = (sequenceNumber: number): IMemoryMatchCard => {
    const cardName = sequenceNumber.toString();

    return {
        text: {
            items: [
                {
                    languageCode,
                    text: cardName,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
        sequenceNumber: sequenceNumber.toString(),
        audioUrl: buildMediaItemUrl(`${testMediaItemPrefix}-audio-${sequenceNumber}`),
        imageUrl: buildMediaItemUrl(`${testMediaItemPrefix}-image-${sequenceNumber}`),
    };
};

const languageCode = LanguageCode.English;

const indexRoute = `games/memoryMatch`;

const targetRoundName = 'Featured Memory Round';

const targetRoundId = buildDummyUuid(1);

const testMemoryRound: IMemoryMatchRound = {
    id: targetRoundId,
    name: {
        items: [
            {
                languageCode,
                text: targetRoundName,
                role: MultilingualTextItemRole.original,
            },
        ],
    },
    cardbackImageUrl: buildMediaItemUrl(`${testMediaItemPrefix}-cardback`),
    cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
        .fill(undefined)
        .map((_, index) => buildMemoryCard(index + 1)),
    isPublished: true,
    contributors: [
        {
            contributorIds: ['123'],
            statement: 'Round contributed',
            type: 'knowledge keeper',
            date: {
                month: 'January',
                year: 1,
                day: 20,
            },
            timestamp: 1763508853,
        },
    ],
    size: NUMBER_OF_PAIRS_IN_A_ROUND,
};

describe(`Memory Match game play`, () => {
    // right now, this is just a placeholder
    describe(`the index (list) view`, () => {
        describe(`when there are no rounds to view`, () => {
            beforeEach(() => {
                cy.visit(indexRoute);
            });

            it(`should display a "not found" message`, () => {
                cy.contains('No result');
            });
        });

        // describe(`when there are some rounds`, () => {
        //     before(() => {
        //         cy.clearDatabase();

        //         cy.seedDatabase(`memory_match_rounds`, [testMemoryRound]);
        //     });

        //     beforeEach(() => {
        //         cy.visit(indexRoute);
        //     });

        //     describe(`when no filters have been selected`, () => {
        //         it(`should display all rounds`, () => {
        //             cy.contains(targetRoundName);
        //         });
        //     });
        // });
    });
});
