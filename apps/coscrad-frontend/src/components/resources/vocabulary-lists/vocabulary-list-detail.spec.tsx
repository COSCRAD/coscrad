import { ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummyVocabularyLists } from './test-utils/build-dummy-vocabulary-lists';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const dummyVocabularyLists = buildDummyVocabularyLists();

const idToFind = dummyVocabularyLists[0].id;

const endpoint = `${getConfig().apiUrl}/resources/vocabularyLists`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.vocabularyList);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('vocabulary list detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyVocabularyLists.map((item) => [item, []]),
                    []
                ),
            }),
            mockGetNotesHandler
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
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
