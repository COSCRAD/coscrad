import {
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';

// TODO call this file `term-index.rbac.e2e.cy` or `term-index.access-control.cy`

const buildTextByAccess = (index: number, publishedState: string) =>
    `This term is ${publishedState} #${index}.`;

const buildTermDocument = (
    text: string,
    isPublished: boolean,
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
        isPublished: isPublished,
        vocabularyLists: [],
        tokens: [],
        notes: {},
        connections: [],
        contributions: [],
        actions: [],
    };
};

const unpublishedTermIndex = 1;

const publishedTermIndex = 2;

const unpublishedTermText = buildTextByAccess(unpublishedTermIndex, 'not published');

const publishedTermText = buildTextByAccess(publishedTermIndex, 'published');

const unpublishedTerm = buildTermDocument(unpublishedTermText, false, unpublishedTermIndex);

const publishedTerm = buildTermDocument(publishedTermText, true, publishedTermIndex);

const allTerms = [unpublishedTerm, publishedTerm];

const termIndexRoute = `Resources/Terms`;

describe(`Term admin role access`, () => {
    beforeEach(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    describe(`when the user is not logged in`, () => {
        describe(`when there are published and unpublished terms`, () => {
            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms);

                cy.visit(termIndexRoute);
            });

            it(`should display the text for the published term`, () => {
                cy.contains(publishedTermText);
            });

            it(`should not display the text for the unpublished term`, () => {
                cy.contains(unpublishedTermText).should('not.exist');
            });
        });
    });

    describe(`when the user is logged in`, () => {
        describe(`when there are published and unpublished terms`, () => {
            beforeEach(() => {
                cy.seedDatabase('term__VIEWS', allTerms);

                cy.visit('/');

                cy.login();

                cy.navigateToResourceIndex(ResourceType.term);
            });

            it(`should display the text for the published term`, () => {
                cy.contains(publishedTermText);
            });

            it(`should display the text for the unpublished term (admin have RBAC permissions to view all terms)`, () => {
                cy.contains(unpublishedTermText);
            });
        });
    });
});
