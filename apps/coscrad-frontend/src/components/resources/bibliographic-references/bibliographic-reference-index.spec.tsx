import { ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { renderResourceIndexPageForTest } from '../test-utils';
import { buildDummyBibliographicReferences } from './test-utils/build-dummy-bibliographic-references';

const dummyBibliographicReferences = buildDummyBibliographicReferences();

const endpoint = `${getConfig().apiUrl}/resources/bibliographicReferences`;

const act = () => renderResourceIndexPageForTest(ResourceType.bibliographicReference);

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

        it('should display the bibliographic references', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyBibliographicReferences);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
