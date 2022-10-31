import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithTestIdOnScreen } from '../../../utils/test-utils/assertions/assertElementWithTestIdOnScreen';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { NOT_FOUND_TEST_ID } from '../../../utils/test-utils/constants';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
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
        <MemoryRouter initialEntries={[`/Resources/Terms/${idInLocation}`]}>
            <Routes>
                <Route path={`Resources/Terms/:id`} element={<TermDetailContainer />} />
            </Routes>
        </MemoryRouter>
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

                await assertElementWithTestIdOnScreen(NOT_FOUND_TEST_ID);
            });
        });
    });

    describe('when the API request is invalid', () => {
        testContainerComponentErrorHandling(() => act(idOfTermToFind), endpoint);
    });
});
