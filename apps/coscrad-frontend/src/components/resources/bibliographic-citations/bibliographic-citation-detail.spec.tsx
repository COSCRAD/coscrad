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
import { buildDummyBibliographicCitations } from './test-utils/build-dummy-bibliographic-citations';

const dummyBibliographicCitations = buildDummyBibliographicCitations();

const referenceToFind = dummyBibliographicCitations[0];

const { id: idToFind } = referenceToFind;

const endpoint = `${getConfig().apiUrl}/Resources/bibliographicCitations`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.bibliographicCitation);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('bibliographic citation detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyBibliographicCitations.map((reference) => [reference, []]),
                    []
                ),
            }),
            buildMockResourceInfoHandler(),
            mockGetNotesHandler
        );

        describe('when the ID in the route matches an existing bibliographic citation', () => {
            it('should display the bibliographic citation', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(
                    `${AggregateType.bibliographicCitation}/${idToFind}`
                );
            });
        });

        describe('when the ID in the route does not match any existing bibliographic citation', () => {
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
