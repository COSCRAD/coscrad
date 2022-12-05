import { ITagViewModel } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { getConfig } from '../../config';
import { assertNotFound, renderWithProviders } from '../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { withDetailRoute } from '../../utils/test-utils/with-detail-route';
import { TagDetailContainer } from './tag-detail.container';

const allTags: ITagViewModel[] = [
    {
        label: 'birds',
        id: '201',
        // TODO Add members
        members: [],
    },
    {
        label: 'reptiles',
        id: '202',
        members: [],
    },
];

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const endpoint = `${getConfig().apiUrl}/tags`;

const tagToFind = allTags[0];

const idToFind = tagToFind.id;

const act = (idInLocation: string) =>
    renderWithProviders(withDetailRoute(idInLocation, `/Tags/`, <TagDetailContainer />));

describe(`Tag Detail`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: allTags,
            })
        );
        describe(`when the tag ID in the route corresponds to an existing tag`, () => {
            it('should display the tag', async () => {
                act(idToFind);

                await waitFor(() => expect(screen.getByTestId(idToFind)).toBeTruthy());
            });
        });

        describe(`when there is no tag with the ID provided in the route`, () => {
            it('should render NotFound', async () => {
                act('bogus-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request is invalid', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
