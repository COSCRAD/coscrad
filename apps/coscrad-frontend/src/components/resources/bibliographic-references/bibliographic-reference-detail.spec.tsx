import { ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildMockResourceInfoHandler } from '../../resource-info/build-dummy-resource-info';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummyBibliographicReferences } from './test-utils/build-dummy-bibliographic-references';

const dummyBibliographicReferences = buildDummyBibliographicReferences();

const referenceToFind = dummyBibliographicReferences[0];

const { id: idToFind } = referenceToFind;

const endpoint = `${getConfig().apiUrl}/Resources/bibliographicReferences`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.bibliographicReference);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('bibliographic reference detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    // @ts-expect-error Do we have access to the union type here?
                    dummyBibliographicReferences.map((reference) => [reference, []]),
                    []
                ),
            }),
            buildMockResourceInfoHandler(),
            mockGetNotesHandler
        );

        describe('when the ID in the route matches an existing bibliographic reference', () => {
            it('should display the bibliographic reference', async () => {
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

    // TODO [https://www.pivotaltracker.com/story/show/185546456] Implement this test with Cypress
    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
