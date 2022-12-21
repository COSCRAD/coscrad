import { ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummySpatialFeatures } from './test-utils/build-dummy-spatial-features';

const dummySpatialFeatures = buildDummySpatialFeatures();

const referenceSpatialFeatureToFind = dummySpatialFeatures[0];

const { id: idToFind } = referenceSpatialFeatureToFind;

const endpoint = `${getConfig().apiUrl}/Resources/spatialFeatures`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.spatialFeature);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('spatial feature detail', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummySpatialFeatures.map((feature) => [feature, []]),
                    []
                ),
            }),
            mockGetNotesHandler
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
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
