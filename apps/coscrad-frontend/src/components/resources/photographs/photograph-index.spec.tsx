import { IPhotographViewModel, ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { renderResourceIndexPageForTest } from '../test-utils';

const dummyPhotographs: IPhotographViewModel[] = [
    {
        id: '123',
        photographer: 'Bobby Blue Bland',
        imageURL: 'https://mypics.somecloud.org/pic123.jpg',
    },
    {
        id: '124',
        photographer: 'Janet Jackson',
        imageURL: 'https://mypics.somecloud.org/pic124.jpg',
    },
    {
        id: '125',
        photographer: 'Kermit DeFrog',
        imageURL: 'https://mypics.somecloud.org/pic125.jpg',
    },
];

const endpoint = `${getConfig().apiUrl}/resources/photographs`;

const act = () => renderResourceIndexPageForTest(ResourceType.photograph);

describe('Photograph Index', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyPhotographs.map((photo) => [photo, []]),
                    []
                ),
            })
        );

        it('should display the photographs', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyPhotographs);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
