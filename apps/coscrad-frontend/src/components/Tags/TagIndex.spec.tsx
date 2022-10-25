import { ITagViewModel } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { renderWithProviders } from '../../utils/test-utils/renderWithProviders';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { TagIndexContainer } from './TagIndex.container';

const dummyTags: ITagViewModel[] = [
    {
        label: 'trees',
        id: '101',
    },
    {
        label: 'animals',
        id: '102',
    },
    {
        label: 'plants',
        id: '103',
    },
];

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

            await waitFor(() => expect(screen.getByTestId(dummyTags[0].id)).toBeTruthy());
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
