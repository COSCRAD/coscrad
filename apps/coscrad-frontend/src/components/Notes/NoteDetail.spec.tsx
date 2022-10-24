import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { assertElementWithTestIdOnScreen } from '../../utils/test-utils/assertions/assertElementWithTestIdOnScreen';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { NoteDetailContainer } from './NoteDetail.container';
import { buildDummyNotes } from './test-utils/buildDummyNotes';

const dummyNotes = buildDummyNotes();

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const endpoint = `${getConfig().apiUrl}/connections/notes`;

const noteToFind = dummyNotes[0];

const initialRoute = `/Notes/${noteToFind.id}`;

const act = () =>
    renderWithProviders(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
                <Route path="/Notes/:id" element={<NoteDetailContainer />} />
            </Routes>
        </MemoryRouter>
    );

describe(`Note detail flow`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyNotes,
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
