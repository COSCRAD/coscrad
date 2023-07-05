import { LanguageCode, MultilingualTextItemRole, ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildMockResourceInfoHandler } from '../../resource-info/build-dummy-resource-info';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const idOfTermToFind = '123';

const termToFind = {
    id: idOfTermToFind,
    name: {
        items: [
            {
                text: 'term 123 in Language',
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.original,
            },
        ],
    },
    term: 'term 123 in language',
    termEnglish: 'term 123 translated to English',
};

const allTerms = [termToFind];

const endpoint = `${getConfig().apiUrl}/resources/terms`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.term);

describe('Term Detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    /**
                     * TODO [https://www.pivotaltracker.com/story/show/183783911]
                     * Add detail scoped actions and check they are displayed.
                     */
                    allTerms.map((term) => [term, []]),
                    []
                ),
            }),
            buildMockResourceInfoHandler(),
            buildMockGetNotesHandler()
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

    // TODO [https://www.pivotaltracker.com/story/show/185546456] Implement this test with Cypress
    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(
            () => act(idOfTermToFind),
            endpoint,
            buildMockGetNotesHandler()
        );
    });
});
