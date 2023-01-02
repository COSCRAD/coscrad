import { CategorizableType, IBaseViewModel, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { assertElementWithTestIdOnScreen, renderWithProviders } from '../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { TestId } from '../../utils/test-utils/constants';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../utils/test-utils/test-data';
import { buildDummyBooks } from '../resources/books/test-utils/build-dummy-books';
import { buildDummyTerms } from '../resources/terms/test-utils/build-dummy-terms';
import { buildDummyVocabularyLists } from '../resources/vocabulary-lists/test-utils/build-dummy-vocabulary-lists';
import { CategoryTreeContainer } from './category-tree.container';

const dummyBooks = buildDummyBooks();

const dummyTerms = buildDummyTerms();

const dummyVocabularyLists = buildDummyVocabularyLists();

const grandChildCategory: ICategoryTreeViewModel = {
    id: 'grandchild-1',
    label: 'grandchild category label',
    // bachelor for life
    children: [],
    members: [
        {
            type: 'book',
            id: '99',
        },
    ],
};

const childCategory1: ICategoryTreeViewModel = {
    id: 'child-1',
    label: 'child 1 label',
    children: [grandChildCategory],
    members: [
        {
            type: CategorizableType.book,
            id: dummyBooks[0].id,
        },
        {
            type: CategorizableType.term,
            id: dummyTerms[0].id,
        },
    ],
};

const childCategory2: ICategoryTreeViewModel = {
    id: 'child-2',
    label: 'child 2 label',
    children: [],
    members: [],
};

const childrenCategories: ICategoryTreeViewModel[] = [childCategory1, childCategory2];

const dummyCategoryTree: ICategoryTreeViewModel = {
    id: '0',
    label: 'zero node',
    children: childrenCategories,
    members: [
        {
            type: CategorizableType.book,
            id: dummyBooks[1].id,
        },
        {
            type: CategorizableType.vocabularyList,
            id: dummyVocabularyLists[0].id,
        },
        {
            type: CategorizableType.term,
            id: dummyTerms[1].id,
        },
    ],
};

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const { apiUrl } = getConfig();

const resourcesBaseEndpoint = `${apiUrl}/resources`;

const endpoint = `${apiUrl}/treeOfKnowledge`;

const termsEndpoint = `${resourcesBaseEndpoint}/terms`;

const booksEndpoint = `${resourcesBaseEndpoint}/books`;

const vocabularyListsEndpoint = `${resourcesBaseEndpoint}/vocabularyLists`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <CategoryTreeContainer />
        </MemoryRouter>
    );

const buildIndexResponse = (models: IBaseViewModel[]) =>
    buildMockIndexResponse(
        models.map((model) => [model, []]),
        []
    );

describe('Category Tree', () => {
    describe('when the API request for categories is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyCategoryTree,
            }),
            ...(
                [
                    [termsEndpoint, dummyTerms],
                    [booksEndpoint, dummyBooks],
                    [vocabularyListsEndpoint, dummyVocabularyLists],
                ] as const
            ).map(([endpoint, models]) =>
                buildMockSuccessfulGETHandler({
                    endpoint,
                    response: buildIndexResponse(models),
                })
            )
        );

        it('should display the category tree nodes', async () => {
            act();

            // Add this back when rendering individual nodes
            // await assertElementWithTestIdOnScreen(childCategory2.id);

            await assertElementWithTestIdOnScreen(TestId.categoryTree);
        });
    });
});
