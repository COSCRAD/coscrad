import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { SongIndexContainer } from './song-index.container';
import { buildDummySongs } from './test-utils/build-dummy-songs';

const dummySongs = buildDummySongs();

const endpoint = `${getConfig().apiUrl}/resources/songs`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <SongIndexContainer />
        </MemoryRouter>
    );

describe('Song Index', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummySongs.map((photo) => [photo, []]),
                    []
                ),
            })
        );

        it('should display the songs', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummySongs);
        });
    });

    describe('when the API requests fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
