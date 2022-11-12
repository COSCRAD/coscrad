import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildDummyVocabularyLists } from './test-utils/build-dummy-vocabulary-lists';
import { VocabularyListIndexContainer } from './vocabulary-list-index.container';

const dummyVocabularyLists = buildDummyVocabularyLists();

const endpoint = `${getConfig().apiUrl}/resources/vocabularyLists`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <VocabularyListIndexContainer />
        </MemoryRouter>
    );

describe('Vocabulary List Index', () => {
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

        it('should display the vocabulary lists', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyVocabularyLists);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
