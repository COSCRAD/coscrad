import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getConfig } from '../../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { SongDetailContainer } from './song-detail.container';
import { buildDummySongs } from './test-utils/build-dummy-songs';

const dummySongs = buildDummySongs();

const songToFind = dummySongs[0];

const { id: idToFind } = songToFind;

const endpoint = `${getConfig().apiUrl}/resources/songs`;

const dummyIndexResponse = buildMockIndexResponse(
    dummySongs.map((song) => [song, []]),
    []
);

const act = (idInLocation: string) =>
    renderWithProviders(
        <MemoryRouter initialEntries={[`/Resources/Songs/${idInLocation}`]}>
            <Routes>
                <Route path={`Resources/Songs/:id`} element={<SongDetailContainer />} />
            </Routes>
        </MemoryRouter>
    );

describe('song detail', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyIndexResponse,
            })
        );

        describe('when the ID in the route corresponds to an existing song', () => {
            it('should display the song', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when there is no song that matches the ID in the route', () => {
            it('should render not found', async () => {
                act('bogus-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
