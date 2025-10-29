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

describe(`Pagination in the Term Index view`, () => {
    beforeEach(() => {
        cy.clearDatabase();
    });

    describe(`when there are no filters`, () => {
        describe(`when there is no data to display`, () => {
            it.skip(`should have a test`);
        });

        describe('when there is less than one full page of results', () => {
            it(`should have a test`);
        });
    });

    describe(`when there are filters`, () => {
        describe(`when the filters find less than one page of results`, () => {
            it(`should have a test`);
        });

        describe(`when the filters find several pages of results`, () => {
            const numberOfPagesThatMatch = 3;

            const numberOfNonMatchingDocuments = targetPageSize * 2 + 3;

            const matchingTermDocuments = Array(targetPageSize * numberOfPagesThatMatch)
                .fill(null)
                .map((_, index) => buildTermDocument(buildTextThatMatchesSearch(index), index));

            const allTerms = matchingTermDocuments;

            const nonMatchingTermDocuments = Array(
                numberOfNonMatchingDocuments * numberOfNonMatchingDocuments
            )
                .fill(null)
                .map((_, index) =>
                    buildTermDocument(buildTextThatDoesntMatchSearch(index + 1000), index + 1000)
                );

            allTerms.push(...nonMatchingTermDocuments);

            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms);

                cy.visit(termIndexRoute);
            });

            it(`should lazily load each page properly`, () => {
                cy.getLoading().should('not.exist');

                cy.getByDataAttribute(`index_search_bar`).click();

                cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                cy.getLoading().should('not.exist');

                cy.contains(`Page: 1/3`);

                cy.contains(`You can find me #1.`);

                cy.contains(`You can find me #${2 * targetPageSize + 1}.`).should('not.exist');

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                cy.contains(`Page: 2/3`);

                cy.getLoading().should('not.exist');

                cy.contains(`You can find me #1.`).should('not.exist');

                cy.contains(`You can find me #${targetPageSize + 1}.`);

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                cy.contains(`Page: 3/3`);

                cy.getLoading().should('not.exist');

                cy.contains(`You can find me #1.`).should('not.exist');

                cy.contains(`You can find me #${2 * targetPageSize + 1}.`);

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                // here we ensure that the page carousel "wraps around"
                cy.contains(`Page: 1/3`);

                cy.getLoading().should('not.exist');

                cy.contains(`You can find me #${2 * targetPageSize + 1}`).should('not.exist');

                cy.getByDataAttribute('ArrowForwardIosIcon').click();

                // ensure wrap around "to the left" as well
                cy.contains(`Page: 2/3`);
            });
        });
    });
});
