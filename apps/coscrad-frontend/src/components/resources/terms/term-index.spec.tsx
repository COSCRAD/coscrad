import {
    AggregateType,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../../src/utils/test-utils';
import { TermIndexContainer } from '../../../../term-index.container';
import { getConfig } from '../../../config';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';

const dummyTerms: ITermViewModel[] = [
    {
        id: '12',
        contributions: [],
    },

    {
        id: '13',
        contributions: [],
    },
    {
        id: '14',
        contributions: [],
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
    vocabularyLists: [],
    actions: [],
    isPublished: true,
    tokens: [],
    notes: [],
    connections: [],
}));

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

            await assertElementWithEveryIdRenderedForIndex(dummyTerms, AggregateType.term);
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
