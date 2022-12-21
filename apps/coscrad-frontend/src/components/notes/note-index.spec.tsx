import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { DEFAULT_PAGE_SIZE } from '../../utils/generic-components/presenters/tables';
import { renderWithProviders } from '../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../utils/test-utils/test-data';
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
                response: buildMockIndexResponse(
                    dummyNotes.map((note) => [note, []]),
                    []
                ),
            })
        );

        it('should display the notes', async () => {
            act();

            /**
             * This is a hack. We probably want to make the page size options
             * injectable via a config and set the initial page number for tests.
             *
             * TODO We should test pagination behaviour.
             */
            await assertElementWithEveryIdRenderedForIndex(dummyNotes.slice(0, DEFAULT_PAGE_SIZE));
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
