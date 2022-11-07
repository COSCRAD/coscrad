import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { SpatialFeatureIndexContainer } from './spatial-feature-index.container';
import { buildDummySpatialFeatures } from './test-utils/build-dummy-spatial-features';

const dummySpatialFeatures = buildDummySpatialFeatures();

const endpoint = `${getConfig().apiUrl}/resources/spatialFeatures`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <SpatialFeatureIndexContainer />
        </MemoryRouter>
    );

describe('Spatial Feature Index', () => {
    describe(`when the API request succeeds`, () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummySpatialFeatures.map((feature) => [feature, []]),
                    []
                ),
            })
        );

        it('should display the spatial features', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummySpatialFeatures);
        });
    });

    describe('when the API request has failed or is in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
