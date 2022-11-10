import { ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { withDetailRoute } from '../../../utils/test-utils/with-detail-route';
import { TranscribedAudioDetailContainer } from './transcribed-audio-detail.container';

const idToFind = '44';

const transcribedAudioToFind: ITranscribedAudioViewModel = {
    id: idToFind,
    audioURL: 'https://www.soundbox.org/123.mp3',
    start: 0,
    length: 5600,
    plainText: '[0:01] Blah blah blah [0:05]',
};

const dummyTranscribedAudioItems: ITranscribedAudioViewModel[] = [
    {
        id: '90',
        audioURL: 'https://www.soundbox.org/1245.mp3',
        start: 0,
        length: 56500,
        plainText: '[0:03] testing, this is a test! [0:05]',
    },
    transcribedAudioToFind,
];

const endpoint = `${getConfig().apiUrl}/resources/transcribedAudioItems`;

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(
            idInLocation,
            `/Resources/Transcripts/`,
            <TranscribedAudioDetailContainer />
        )
    );

describe('transribed audio detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyTranscribedAudioItems.map((item) => [item, []]),
                    []
                ),
            })
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
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
