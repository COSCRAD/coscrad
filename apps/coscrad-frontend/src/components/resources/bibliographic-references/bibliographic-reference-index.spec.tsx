import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { BibliographicReferenceIndexContainer } from './bibliographic-reference-index.container';
import { buildDummyBibliographicReferences } from './test-utils/build-dummy-bibliographic-references';

const dummyBibliographicReferences = buildDummyBibliographicReferences();

const endpoint = `${getConfig().apiUrl}/resources/bibliographicReferences`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <BibliographicReferenceIndexContainer />
        </MemoryRouter>
    );

describe('Bibliographic Reference Index', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyBibliographicReferences.map((reference) => [reference, []]),
                    []
                ),
            })
        );

        it('should display the vocabulary lists', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyBibliographicReferences);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
