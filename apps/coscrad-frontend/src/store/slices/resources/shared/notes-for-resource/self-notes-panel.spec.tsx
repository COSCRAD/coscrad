import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    INoteViewModel,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { buildMemberWithGeneralContext } from '../../../../../components/notes/test-utils';
import { buildDummySongs } from '../../../../../components/resources/songs/test-utils/build-dummy-songs';
import { getConfig } from '../../../../../config';
import {
    assertElementWithTestIdOnScreen,
    renderWithProviders,
} from '../../../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../../../utils/test-utils/test-data';
import { SelfNotesPanelContainer } from './self-notes-panel.container';

const resourceOfFocus = buildDummySongs()[0];

const compositeIdentifierOfFocus: ResourceCompositeIdentifier = {
    type: ResourceType.song,
    id: resourceOfFocus.id,
};

const NUMBER_OF_DUMMY_NOTES = 10;

const dummyNotes: INoteViewModel[] = Array(NUMBER_OF_DUMMY_NOTES)
    .fill(0)
    .map(
        (_, index): INoteViewModel => ({
            id: index.toString(),
            connectionType: EdgeConnectionType.self,
            note: `This is note number: ${index}`,
            connectedResources: [
                buildMemberWithGeneralContext(
                    compositeIdentifierOfFocus,
                    EdgeConnectionMemberRole.self
                ),
            ],
        })
    );

const act = () =>
    renderWithProviders(
        <SelfNotesPanelContainer compositeIdentifier={compositeIdentifierOfFocus} />
    );

const noteEndpoint = `${getConfig().apiUrl}/connections/notes`;

describe(`Self Notes Panel`, () => {
    describe('when the API request succeeds', () => {
        describe('when there are some notes for the given resource', () => {
            setupTestServer(
                buildMockSuccessfulGETHandler({
                    endpoint: noteEndpoint,
                    response: buildMockIndexResponse(
                        dummyNotes.map((note) => [note, []]),
                        []
                    ),
                })
            );

            it('should render the self notes panel', async () => {
                act();

                await assertElementWithTestIdOnScreen('selfNotesPanel');
            });

            it('should render each note', async () => {
                act();

                await assertElementWithEveryIdRenderedForIndex(dummyNotes);
            });
        });

        describe('when there are no notes for the given resource', () => {
            setupTestServer(
                buildMockSuccessfulGETHandler({
                    endpoint: noteEndpoint,
                    response: buildMockIndexResponse([], []),
                })
            );

            it('should render the self notes panel', async () => {
                act();

                await assertElementWithTestIdOnScreen('selfNotesPanel');
            });

            it.todo('should render an empty self notes panel');
        });
    });

    describe('when the API request is pending or has failed', () => {
        testContainerComponentErrorHandling(act, noteEndpoint);
    });
});
