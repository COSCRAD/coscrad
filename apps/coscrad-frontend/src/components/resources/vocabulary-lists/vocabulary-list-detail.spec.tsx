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
import { buildDummyVocabularyLists } from './test-utils/build-dummy-vocabulary-lists';
import { VocabularyListDetailContainer } from './vocabulary-list-detail.container';

const dummyVocabularyLists = buildDummyVocabularyLists();

const idToFind = dummyVocabularyLists[0].id;

const endpoint = `${getConfig().apiUrl}/resources/vocabularyLists`;

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(
            idInLocation,
            `/Resources/VocabularyLists/`,
            <VocabularyListDetailContainer />
        )
    );

describe('vocabulary list detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyVocabularyLists.map((item) => [item, []]),
                    []
                ),
            })
        );

        describe('when the ID in the route matches an existing vocabulary list', () => {
            it('should display the vocabulary list', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when the ID in the route does not match any existing vocabulary list', () => {
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
