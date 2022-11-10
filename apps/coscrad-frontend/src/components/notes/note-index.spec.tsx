import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { NoteIndexContainer } from './note-index.container';
import { buildDummyNotes } from './test-utils/build-dummy-notes';

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

            await assertElementWithEveryIdRenderedForIndex(dummyNotes);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
