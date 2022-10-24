import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { assertElementWithTestIdOnScreen } from '../../utils/test-utils/assertions/assertElementWithTestIdOnScreen';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setupTestServer';
import { NoteIndexContainer } from './NoteIndex.container';
import { buildDummyNotes } from './test-utils/buildDummyNotes';

const dummyNotes = buildDummyNotes();

const endpoint = `${getConfig().apiUrl}/connections/notes`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <NoteIndexContainer />
        </MemoryRouter>
    );

describe(`NoteIndex`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyNotes,
            })
        );

        it('should display the notes', async () => {
            act();

            await assertElementWithTestIdOnScreen(dummyNotes[0].id);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
