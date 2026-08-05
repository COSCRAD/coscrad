import { IContributionSummary } from '@coscrad/api-interfaces';
import { doesSomeContributorInclude } from './does-some-contributor-include';

const textToFind = 'Sellars';

const textNotToFind = 'Barney';

const contributionSummaries: IContributionSummary[] = [
    {
        type: 'TERM_CREATED',
        contributorIds: ['23'],
        statement: 'Term created by: Frank Jennings',
        date: {
            day: 12,
            month: '8',
            year: 2021,
        },
        timestamp: 1234567,
    },
    {
        type: 'TERM_TRANSLATED',
        contributorIds: ['23', '24'],
        statement: 'Term translated by: Frank Jennings, Hugh Sellars',
        date: {
            day: 12,
            month: '8',
            year: 2021,
        },
        timestamp: 1234899,
    },
];

describe(`doesSomeContributorInclude`, () => {
    describe(`when the search is empty`, () => {
        it(`should return true`, () => {
            const result = doesSomeContributorInclude(contributionSummaries, '');

            expect(result).toBe(true);
        });
    });

    describe(`when the contributor matches the search`, () => {
        it(`should return true`, () => {
            const result = doesSomeContributorInclude(contributionSummaries, textToFind);

            expect(result).toBe(true);
        });
    });

    describe(`when the contributor does not match the search`, () => {
        it(`should return false`, () => {
            const result = doesSomeContributorInclude(contributionSummaries, textNotToFind);

            expect(result).toBe(false);
        });
    });
});
