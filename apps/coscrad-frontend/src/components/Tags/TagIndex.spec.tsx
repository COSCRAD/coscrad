import { ITag } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { TagIndexContainer } from './TagIndex.container';

const ARTIFICIAL_DELAY = 150;

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

const handlers = [
    rest.get(`${getConfig().apiUrl}/tags`, (_, res, ctx) => {
        return res(ctx.json(dummyTags), ctx.delay(ARTIFICIAL_DELAY));
    }),
];

const server = setupServer(...handlers);

describe(`Tag Index`, () => {
    beforeAll(() => server.listen());

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

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
