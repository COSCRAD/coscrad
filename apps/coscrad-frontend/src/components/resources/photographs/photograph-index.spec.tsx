import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { PhotographIndexContainer } from './photograph-index.container';

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

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <PhotographIndexContainer />
        </MemoryRouter>
    );

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
