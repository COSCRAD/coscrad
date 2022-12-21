import { CategorizableType } from '@coscrad/api-interfaces';
import { getConfig } from '../../config';
import { assertElementWithTestIdOnScreen } from '../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { buildCategorizableDetailPageRendererForTest } from '../resources/test-utils';
import { buildDummyNotes } from './test-utils/build-dummy-notes';

const dummyNotes = buildDummyNotes();

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618729]
 * We need to inject a dummy config. This test should not be dependent upon
 * environment.
 */
const endpoint = `${getConfig().apiUrl}/connections/notes`;

const noteToFind = dummyNotes[0];

const act = () => buildCategorizableDetailPageRendererForTest(CategorizableType.note);

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
