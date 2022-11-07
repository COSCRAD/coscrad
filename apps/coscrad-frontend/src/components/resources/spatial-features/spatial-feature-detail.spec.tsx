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
import { SpatialFeatureDetailContainer } from './spatial-feature-detail.container';
import { buildDummySpatialFeatures } from './test-utils/build-dummy-spatial-features';

const dummySpatialFeatures = buildDummySpatialFeatures();

const referenceSpatialFeatureToFind = dummySpatialFeatures[0];

const { id: idToFind } = referenceSpatialFeatureToFind;

const endpoint = `${getConfig().apiUrl}/Resources/spatialFeatures`;

const act = (idInLocation: string) =>
    renderWithProviders(
        <MemoryRouter initialEntries={[`/Resources/Map/${idInLocation}`]}>
            <Routes>
                <Route path={`Resources/Map/:id`} element={<SpatialFeatureDetailContainer />} />
            </Routes>
        </MemoryRouter>
    );

describe('spaital feature detail', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummySpatialFeatures.map((feature) => [feature, []]),
                    []
                ),
            })
        );

        describe('when the ID in the route matches an existing spatial feature', () => {
            it('should display the spatial feature', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when the ID in the route does not match any existing bibliographic reference', () => {
            it('should render Not Found', async () => {
                act('bogus-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
