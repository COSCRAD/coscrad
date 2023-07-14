import {
    AggregateType,
    IVideoViewModel,
    LanguageCode,
    MIMEType,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { renderResourceIndexPageForTest } from '../test-utils';

const dummyVideos: IVideoViewModel[] = [
    {
        id: '123',
        videoUrl: 'https://www.vidbox.org/123.mp4',
        lengthMilliseconds: 123000,
        text: '[0:05] Wah wah wah [0:09]',
        name: {
            items: [
                {
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                    text: 'Test Video Name in Chilcotin',
                },
            ],
        },
        mimeType: MIMEType.mp4,
    },
];

const endpoint = `${getConfig().apiUrl}/resources/videos`;

const act = () => renderResourceIndexPageForTest(ResourceType.video);

describe(`Video Index`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyVideos.map((video) => [video, []]),
                    []
                ),
            })
        );

        it('should display the videos', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyVideos, AggregateType.video);
        });
    });

    describe(`when the API request is invalid or in progress`, () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
