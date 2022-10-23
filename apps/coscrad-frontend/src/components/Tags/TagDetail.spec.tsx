import { ITag } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { buildGetHandlers } from '../../utils/test-utils/buildGetHandlers';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { TagDetailContainer } from './TagDetail.container';

const allTags: ITag[] = [
    {
        label: 'birds',
        id: '201',
    },
    {
        label: 'reptiles',
        id: '202',
    },
];

// TODO We need to inject a dummy config.
const endpoint = `${getConfig().apiUrl}/tags`;

const handlers = buildGetHandlers([
    {
        endpoint,
        response: allTags,
    },
]);

describe(`Tag Detail`, () => {
    setupTestServer(...handlers);

    describe('when the API request is valid', () => {
        it('should display the tags', async () => {
            const tagToFind = allTags[0];

            const idToFind = tagToFind.id;

            const initialRoute = `/Tags/${idToFind}`;

            renderWithProviders(
                <MemoryRouter initialEntries={[initialRoute]}>
                    <Routes>
                        <Route path="/Tags/:id" element={<TagDetailContainer />}></Route>
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId(idToFind)).toBeTruthy());
        });
    });
});
