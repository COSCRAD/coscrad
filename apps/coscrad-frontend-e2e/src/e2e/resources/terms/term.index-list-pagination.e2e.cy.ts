import { ITermViewModel, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';

const searchTerms = `find me`;

const buildTextThatMatchesSearch = (index: number) => `You can ${searchTerms} #${index}.`;

const buildTextThatDoesntMatchSearch = (index: number) => `I don't exist for you #${index}!`;

const targetPageSize = 5;

const buildTermDocument = (
    text: string,
    index: number
): Omit<ITermViewModel, 'id'> & { _key: string } => {
    return {
        _key: index.toString(),
        name: {
            items: [
                {
                    text,
                    languageCode: LanguageCode.Chilcotin,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
        isPublished: true,
        vocabularyLists: [],
        tokens: [],
        notes: [],
        connections: [],
        contributions: [],
        actions: [],
    };
};

const termIndexRoute = `Resources/Terms`;

const numberOfPagesThatMatch = 3;

const numberOfNonMatchingDocuments = targetPageSize * 2 + 3;

const matchingTermDocuments = Array(targetPageSize * numberOfPagesThatMatch)
    .fill(null)
    .map((_, index) => buildTermDocument(buildTextThatMatchesSearch(index), index));

const allTerms = matchingTermDocuments;

const nonMatchingTermDocuments = Array(numberOfNonMatchingDocuments * numberOfNonMatchingDocuments)
    .fill(null)
    .map((_, index) =>
        buildTermDocument(buildTextThatDoesntMatchSearch(index + 1000), index + 1000)
    );

allTerms.push(...nonMatchingTermDocuments);

describe(`Pagination in the Term Index view`, () => {
    beforeEach(() => {
        cy.clearDatabase();
    });

    describe(`when there are no filters`, () => {
        describe(`when there is no data to display`, () => {
            beforeEach(() => {
                // nothing is added to the db

                cy.visit(termIndexRoute);
            });

            it(`should have a test`, () => {
                cy.getByDataAttribute('not-found');
            });
        });

        describe('when there is less than one full page of results', () => {
            const numberOfTerms = targetPageSize - 1;

            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms.slice(0, numberOfTerms));

                cy.visit(termIndexRoute);

                cy.get('#mui-component-select-pageSize').click();

                cy.get('#mui-component-select-pageSize')
                    .get(`[data-value="${targetPageSize}"`)
                    .click();
            });

            it(`should display one page of results`, () => {
                cy.contains('Page: 1/1');

                cy.contains(`Filtered Records: ${numberOfTerms}`);

                cy.contains(`Showing Records: 1-${numberOfTerms}/${numberOfTerms}`);
            });
        });

        describe(`when there is more than one page of results`, () => {
            // there should be 3 pages, with the 3rd having 2 results
            const numberOfResults = 12;

            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms.slice(0, numberOfResults));

                cy.visit(termIndexRoute);

                cy.get('#mui-component-select-pageSize').click();

                cy.get('#mui-component-select-pageSize')
                    .get(`[data-value="${targetPageSize}"`)
                    .click();
            });

            it(`should display one page of results`, () => {
                cy.contains('Page: 1/3');

                cy.contains(`Filtered Records: ${numberOfResults}`);

                cy.contains(`Showing Records: 1-${targetPageSize}`);

                cy.getByDataAttribute('ArrowBackIosNewIcon').click();

                cy.contains(`Page: 3/3`);

                cy.contains(`Filtered Records: ${numberOfResults}`);

                cy.contains(`Showing Records: 11-12`);
            });
        });
    });

    describe(`when there are filters`, () => {
        describe(`when the filters find less than one page of results`, () => {
            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms);

                cy.visit(termIndexRoute);

                cy.get('#mui-component-select-pageSize').click();

                cy.get('#mui-component-select-pageSize')
                    .get(`[data-value="${targetPageSize}"`)
                    .click();
            });

            it(`should find one page of results`, () => {
                cy.getLoading().should('not.exist');

                cy.getByDataAttribute(`index_search_bar`).click();

                cy.getByDataAttribute(`index_search_bar`).type('You can find me #1.');

                cy.getLoading().should('not.exist');

                cy.contains('Page: 1/1');

                cy.contains(`Filtered Records: 1`);

                cy.contains(`Showing Records: 1-1/1`);
            });
        });

        describe(`when the filters find several pages of results`, () => {
            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms);

                cy.visit(termIndexRoute);

                cy.get('#mui-component-select-pageSize').click();

                cy.get('#mui-component-select-pageSize')
                    .get(`[data-value="${targetPageSize}"`)
                    .click();
            });

            it(`should lazily load each page properly`, () => {
                cy.getLoading().should('not.exist');

                cy.getByDataAttribute(`index_search_bar`).click();

                cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                cy.getLoading().should('not.exist');

                cy.contains(`Page: 1/3`);
                /**
                 * Alphabetically
                 * 0
                 * 1
                 * 10
                 * 11
                 * 12
                 */

                cy.contains(`You can find me #1.`);

                cy.contains(`You can find me #13.`).should('not.exist');

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                cy.contains(`Page: 2/3`);
                /**
                 * Alphabetically
                 * 13
                 * 14
                 * 2
                 * 3
                 * 4
                 */

                cy.getLoading().should('not.exist');

                cy.contains(`You can find me #1.`).should('not.exist');

                cy.contains(`You can find me #3.`);

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                cy.contains(`Page: 3/3`);
                /**
                 * Alphabetically
                 * 5
                 * 6
                 * 7
                 * 8
                 * 9
                 */

                cy.getLoading().should('not.exist');

                cy.contains(`You can find me #1.`).should('not.exist');

                cy.contains(`You can find me #8.`);

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                // here we ensure that the page carousel "wraps around"
                cy.contains(`Page: 1/3`);

                cy.getLoading().should('not.exist');

                cy.contains(`You can find me #9.`).should('not.exist');

                // TODO Change this to the new icon
                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                // ensure wrap around "to the left" as well
                cy.contains(`Page: 2/3`);
            });
        });
    });
});
