import { ITag } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { TagDetailContainer } from './TagDetail.container';

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

/**
 * This is still WIP. I need to deal with the route param
 * in order to get this test to pass.
 *
 * [This article](https://medium.com/@aarling/mocking-a-react-router-match-object-in-your-component-tests-fa95904dcc55)
 * looks helpful.
 */
describe(`Tag Detail`, () => {
    beforeAll(() => server.listen());

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

    describe('when the API request is valid', () => {
        it('should display the tags', async () => {
            renderWithProviders(
                <MemoryRouter>
                    <TagDetailContainer></TagDetailContainer>
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText(dummyTags[0].label)).toBeTruthy());
        });
    });
});
