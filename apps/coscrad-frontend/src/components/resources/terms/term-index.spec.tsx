import {
    AggregateType,
    ITermViewModel,
    LanguageCode,
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

const dummyTerms: ITermViewModel[] = [
    {
        id: '12',
        contributions: ['Jane Doe'],
    },

    {
        id: '13',
        contributions: ['Jane Doe'],
    },
    {
        id: '14',
        contributions: ['Jane Doe', 'John Doe'],
    },
].map((partial) => ({
    ...partial,
    name: {
        items: [
            {
                languageCode: LanguageCode.Haida,
                role: MultilingualTextItemRole.original,
                text: `text for term: ${partial.id}`,
            },
        ],
    },
}));

const endpoint = `${getConfig().apiUrl}/Resources/Terms`;

const act = () => renderResourceIndexPageForTest(ResourceType.term);

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

            await assertElementWithEveryIdRenderedForIndex(dummyTerms, AggregateType.term);
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
