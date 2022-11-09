import { getConfig } from '../../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { withDetailRoute } from '../../../utils/test-utils/with-detail-route';
import { TermDetailContainer } from './TermDetail.container';

const idOfTermToFind = '123';

const termToFind = {
    id: idOfTermToFind,
    term: 'term 123 in language',
    termEnglish: 'term 123 translated to English',
};

const allTerms = [termToFind];

const endpoint = `${getConfig().apiUrl}/resources/terms`;

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(idInLocation, `/Resources/Terms/`, <TermDetailContainer />)
    );

describe('Term Detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    // TODO add detail scoped actions and check they are displayed
                    allTerms.map((term) => [term, []]),
                    []
                ),
            })
        );

        describe('when the term ID in the route corresponds to an existing term', () => {
            it('should display the term', async () => {
                act(idOfTermToFind);

                await assertElementWithTestIdOnScreen(idOfTermToFind);
            });
        });

        describe('when there is no term that matches the term ID in the route', () => {
            it('should render not found', async () => {
                act('totally-bogus-id-125');

                await assertNotFound();
            });
        });
    });

    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idOfTermToFind), endpoint);
    });
});
