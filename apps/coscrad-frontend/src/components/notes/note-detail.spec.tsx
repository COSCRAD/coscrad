import { getConfig } from '../../config';
import { assertElementWithTestIdOnScreen, renderWithProviders } from '../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../utils/test-utils/test-data';
import { withDetailRoute } from '../../utils/test-utils/with-detail-route';
import { NoteDetailPageContainer } from './note-detail-page.container';
import { buildDummyNotes } from './test-utils/build-dummy-notes';

const dummyNotes = buildDummyNotes();

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const endpoint = `${getConfig().apiUrl}/connections/notes`;

const noteToFind = dummyNotes[0];

const act = () =>
    renderWithProviders(withDetailRoute(noteToFind.id, `/Notes/`, <NoteDetailPageContainer />));

describe(`Note detail flow`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyNotes.map((note) => [note, []]),
                    []
                ),
            })
        );

        it('should display the notes', async () => {
            act();

            assertElementWithTestIdOnScreen(noteToFind.id);
        });
    });

    describe('when the API request is invalid', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
