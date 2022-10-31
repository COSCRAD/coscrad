import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, renderWithProviders } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { TermIndexContainer } from './TermIndex.container';

const dummyTerms = [
    {
        id: '12',
    },

    {
        id: '13',
    },
    {
        id: '14',
    },
];

const endpoint = `${getConfig().apiUrl}/Resources/Terms`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <TermIndexContainer />
        </MemoryRouter>
    );

describe(`Term Index`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyTerms.map((term) => [term, []]),
                    []
                ),
            })
        );

        it('should display the tags', async () => {
            act();

            await assertElementWithTestIdOnScreen(dummyTerms[1].id);
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});