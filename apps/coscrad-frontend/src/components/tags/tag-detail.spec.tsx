import { AggregateType, ITagViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../utils/test-utils/test-data';
import { withDetailRoute } from '../../utils/test-utils/with-detail-route';
import { AggregatePage } from '../higher-order-components/aggregate-page';
import { TagDetailPresenter } from './tag-detail.presenter';
import { buildDummyTags } from './test-utils';

const allTags: ITagViewModel[] = buildDummyTags();

const endpoint = `${getConfig().apiUrl}/tags`;

const tagToFind = allTags[0];

const idToFind = tagToFind.id;

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(
            idInLocation,
            `/Tags/`,
            <AggregatePage aggregateType={AggregateType.tag} DetailPresenter={TagDetailPresenter} />
        )
    );

describe(`Tag Detail`, () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    allTags.map((tag) => [tag, []]),
                    []
                ),
            })
        );
        describe(`when the tag ID in the route corresponds to an existing tag`, () => {
            it('should display the tag', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(`${AggregateType.tag}/${idToFind}`);
            });
        });

        describe(`when there is no tag with the ID provided in the route`, () => {
            it('should render NotFound', async () => {
                act('bogus-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request is invalid', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
