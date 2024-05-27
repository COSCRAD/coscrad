import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildMockResourceInfoHandler } from '../../resource-info/build-dummy-resource-info';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummyVideos } from './test-utils/build-dummy-videos';

const dummyVideos = buildDummyVideos();

const videoToFind = dummyVideos[0];

const idtoFind = videoToFind.id;

const endpoint = `${getConfig().apiUrl}/resources/videos`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.video);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('video detail', () => {
    describe(`when the API request is valid`, () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyVideos.map((video) => [video, []]),
                    []
                ),
            }),
            buildMockResourceInfoHandler(),
            buildMockGetNotesHandler()
        );

        describe('when the ID in the route coresponds to an existing video', () => {
            it('should display the video', async () => {
                act(idtoFind);

                await assertElementWithTestIdOnScreen(`${AggregateType.video}/${idtoFind}`);
            });
        });

        describe('when there is no transcribed audio item that matches the ID in the route', () => {
            it('should render not found', async () => {
                act('bogusssss');

                await assertNotFound();
            });
        });
    });

    // TODO [https://www.pivotaltracker.com/story/show/185546456] Implement this test with Cypress
    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idtoFind), endpoint, mockGetNotesHandler);
    });
});
