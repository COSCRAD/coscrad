import { ITag } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { buildGetHandlers } from '../../utils/test-utils/buildGetHandlers';
import { renderWithProviders } from '../../utils/test-utils/renderWithProviders';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { TagIndexContainer } from './TagIndex.container';

const dummyTags: ITag[] = [
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

// TODO We need to inject a dummy config.
const endpoint = `${getConfig().apiUrl}/tags`;

// Would exposing a `buildGetHandler` (singular) make more sense? We can always map over an array.
const handlers = buildGetHandlers([
    {
        endpoint,
        response: dummyTags,
    },
]);

describe(`Tag Index`, () => {
    setupTestServer(...handlers);

    describe('when the API request is valid', () => {
        it('should display the tags', async () => {
            renderWithProviders(
                <MemoryRouter>
                    <TagIndexContainer></TagIndexContainer>
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId(dummyTags[0].id)).toBeTruthy());
        });
    });
});
