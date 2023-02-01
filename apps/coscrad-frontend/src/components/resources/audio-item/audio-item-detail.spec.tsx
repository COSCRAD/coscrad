import { IAudioItemViewModel, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const idToFind = '44';

const transcribedAudioToFind: IAudioItemViewModel = {
    id: idToFind,
    audioURL: 'https://www.soundbox.org/123.mp3',
    lengthMilliseconds: 5600,
    text: '[0:01] Blah blah blah [0:05]',
    name: 'Test Audio 1',
    mimeType: MIMEType.mp3,
};

const dummyTranscribedAudioItems: IAudioItemViewModel[] = [
    {
        id: '90',
        audioURL: 'https://www.soundbox.org/1245.mp3',
        lengthMilliseconds: 56500,
        text: '[0:03] testing, this is a test! [0:05]',
        name: 'Test Audio 2',
        mimeType: MIMEType.mp3,
    },
    transcribedAudioToFind,
];

const endpoint = `${getConfig().apiUrl}/resources/transcribedAudioItems`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.audioItem);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('audio item detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyTranscribedAudioItems.map((item) => [item, []]),
                    []
                ),
            }),
            mockGetNotesHandler
        );

        describe('when the ID in the route corresponds to an existing transcribed audio item', () => {
            it('should display the item', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when there is no transcribed audio item that matches the ID in the route', () => {
            it('should render not found', async () => {
                act('totally-bogus-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
