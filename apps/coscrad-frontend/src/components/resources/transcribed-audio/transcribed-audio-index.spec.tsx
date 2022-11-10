import { ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { TranscribedAudioIndexContainer } from './transcribed-audio-index.container';

const dummyTranscribedAudioItems: ITranscribedAudioViewModel[] = [
    {
        id: '44',
        audioURL: 'https://www.soundbox.org/123.mp3',
        start: 0,
        length: 5600,
        plainText: '[0:01] Blah blah blah [0:05]',
    },
];

const endpoint = `${getConfig().apiUrl}/resources/transcribedAudioItems`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <TranscribedAudioIndexContainer />
        </MemoryRouter>
    );

describe('Transcribed Audio Index', () => {
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

        it('should display the transcribed audio items', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyTranscribedAudioItems);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
