import { IAudioItemViewModel, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { renderResourceIndexPageForTest } from '../test-utils';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const dummyTranscribedAudioItems: IAudioItemViewModel[] = [
    {
        id: '44',
        audioURL: 'https://www.soundbox.org/123.mp3',
        lengthMilliseconds: 5600,
        text: '[0:01] Blah blah blah [0:05]',
        name: 'Awesome Audio Interview',
        mimeType: MIMEType.mp3,
    },
];

const endpoint = `${getConfig().apiUrl}/resources/transcribedAudioItems`;

const act = () => renderResourceIndexPageForTest(ResourceType.transcribedAudio);

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
