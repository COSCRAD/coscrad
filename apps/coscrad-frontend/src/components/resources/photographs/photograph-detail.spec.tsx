import {
    AggregateType,
    IPhotographViewModel,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildMockResourceInfoHandler } from '../../resource-info/build-dummy-resource-info';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';

const idToFind = '123';

const photographToFind: IPhotographViewModel = {
    id: idToFind,
    name: {
        items: [
            {
                text: 'doghouse',
                role: MultilingualTextItemRole.original,
                languageCode: LanguageCode.English,
            },
        ],
    },
    photographer: 'Johnny Blue',
    imageUrl: 'https://jazzysnaps.images.com/doghouse.png',
    contributions: [],
    actions: [],
};

/**
 * TODO [https://www.pivotaltracker.com/story/show/183783946]
 * We still need a dummy (system) config and its provider.
 */
const endpoint = `${getConfig().apiUrl}/resources/photographs`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.photograph);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('photograph detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                // TODO add detail scoped actions and check that they are displayed
                response: buildMockIndexResponse([[photographToFind, []]], []),
            }),
            buildMockResourceInfoHandler(),
            mockGetNotesHandler
        );

        describe('when the photograph ID in the route corresponds to an existing photograph', () => {
            it('should display the photograph', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(`${AggregateType.photograph}/${idToFind}`);
            });
        });

        describe('when there is no photograph that matches the ID in the route', () => {
            it('should render not found', async () => {
                act('bogus-photo-id-1243');

                await assertNotFound();
            });
        });
    });

    // TODO [https://www.pivotaltracker.com/story/show/185546456] Implement this test with Cypress
    describe('when the API fails or is pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
