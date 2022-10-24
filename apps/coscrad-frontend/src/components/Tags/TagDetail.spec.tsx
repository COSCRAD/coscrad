import { ITagViewModel } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { TagDetailContainer } from './TagDetail.container';

const allTags: ITagViewModel[] = [
    {
        label: 'birds',
        id: '201',
    },
    {
        label: 'reptiles',
        id: '202',
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

const initialRoute = `/Tags/${idToFind}`;

const act = () =>
    renderWithProviders(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
                <Route path="/Tags/:id" element={<TagDetailContainer />}></Route>
            </Routes>
        </MemoryRouter>
    );

describe(`Tag Detail`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: allTags,
            })
        );

        it('should display the tags', async () => {
            act();

            await waitFor(() => expect(screen.getByTestId(idToFind)).toBeTruthy());
        });
    });

    describe('when the API request is invalid', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
