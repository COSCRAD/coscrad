import { ContributorWithId } from '@coscrad/api-interfaces';
import { doesSomeContributorInclude } from './does-some-contributor-include';

const textToFind = 'Sellars';

const textNotToFind = 'Barney';

const contributorsWithIds: ContributorWithId[] = [
    {
        id: '23',
        fullName: 'Frank Jennings',
    },
    {
        id: '24',
        fullName: 'Hugh Sellars',
    },
];

describe(`doesSomeContributorInclude`, () => {
    describe(`when the contributor matches the search`, () => {
        it(`should return true`, () => {
            const result = doesSomeContributorInclude(contributorsWithIds, textToFind);

            expect(result).toBe(true);
        });
    });

    describe(`when the contributor does not match the search`, () => {
        it(`should return false`, () => {
            const result = doesSomeContributorInclude(contributorsWithIds, textNotToFind);

            expect(result).toBe(false);
        });
    });
});
