import { ITagViewModel } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { assertElementWithEveryIdRenderedForIndex } from '../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { renderWithProviders } from '../../utils/test-utils/render-with-providers';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { TagIndexContainer } from './tag-index.container';
import { buildDummyTags } from './test-utils';

const dummyTags: ITagViewModel[] = buildDummyTags();

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const endpoint = `${getConfig().apiUrl}/tags`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <TagIndexContainer />
        </MemoryRouter>
    );

describe(`Tag Index`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyTags,
            })
        );

        it('should display the tags', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyTags);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
