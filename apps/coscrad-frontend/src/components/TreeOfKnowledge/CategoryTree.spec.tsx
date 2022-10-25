import { ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { assertElementWithTestIdOnScreen } from '../../utils/test-utils/assertions/assertElementWithTestIdOnScreen';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/buildMockSuccessfulGETHandler';
import { CATEGORY_TREE_TEST_ID } from '../../utils/test-utils/constants';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { CategoryTreeContainer } from './CategoryTree.container';

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
            type: 'book',
            id: '345',
        },
        {
            type: 'term',
            id: '39',
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
            type: 'book',
            id: '9992',
        },
        {
            type: 'vocabularyList',
            id: '3',
        },
        {
            type: 'term',
            id: '45',
        },
    ],
};

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const endpoint = `${getConfig().apiUrl}/treeOfKnowledge`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <CategoryTreeContainer />
        </MemoryRouter>
    );

describe('Category Tree', () => {
    describe('when the API request for categories is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyCategoryTree,
            })
        );

        it('should display the category tree nodes', async () => {
            act();

            // Add this back when rendering individual nodes
            // await assertElementWithTestIdOnScreen(childCategory2.id);

            await assertElementWithTestIdOnScreen(CATEGORY_TREE_TEST_ID);
        });
    });
});
