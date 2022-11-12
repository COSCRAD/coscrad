import { getConfig } from '../../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { withDetailRoute } from '../../../utils/test-utils/with-detail-route';
import { BibliographicReferenceDetailContainer } from './bibliographic-reference-detail.container';
import { buildDummyBibliographicReferences } from './test-utils/build-dummy-bibliographic-references';

const dummyBibliographicReferences = buildDummyBibliographicReferences();

const referenceToFind = dummyBibliographicReferences[0];

const { id: idToFind } = referenceToFind;

const endpoint = `${getConfig().apiUrl}/Resources/bibliographicReferences`;

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(
            idInLocation,
            `/Resources/BibliographicReferences/`,
            <BibliographicReferenceDetailContainer />
        )
    );

describe('bibliographic reference detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyBibliographicReferences.map((reference) => [reference, []]),
                    []
                ),
            })
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

    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
