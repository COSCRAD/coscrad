import {
    EdgeConnectionMemberRole,
    IBaseViewModel,
    INoteViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    buildDummyDualEdgeConnection,
    buildMemberWithGeneralContext,
} from '../../../../../components/notes/test-utils/build-dummy-notes';
import { buildDummyBooks } from '../../../../../components/resources/books/test-utils/build-dummy-books';
import { buildDummySpatialFeatures } from '../../../../../components/resources/spatial-features/test-utils/build-dummy-spatial-features';
import { buildDummyTerms } from '../../../../../components/resources/terms/test-utils/build-dummy-terms';
import { getConfig } from '../../../../../config';
import {
    assertElementWithTestIdOnScreen,
    renderWithProviders,
} from '../../../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../../../utils/test-utils/build-mock-successful-get-handler';
import { setupTestServer } from '../../../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../../../utils/test-utils/test-data';
import { ConnectedResourcesPanel } from './connected-resources-panel';

const dummyTerms = buildDummyTerms();

const termOfFocus = dummyTerms[0];

const compositeIdentifierOfTermOfFocus = {
    type: ResourceType.term,
    id: termOfFocus.id,
};

const connectedTerm = dummyTerms[1];

const connectedBook = buildDummyBooks()[0];

const connectedSpatialFeature = buildDummySpatialFeatures()[0];

// Make sure that self connections do not come through
const selfNoteForTerm: INoteViewModel = {
    id: '334',
    note: 'this part is epic',
    relatedResources: [
        buildMemberWithGeneralContext(
            compositeIdentifierOfTermOfFocus,
            EdgeConnectionMemberRole.self
        ),
    ],
};

const dualConnections = [
    buildDummyDualEdgeConnection(
        compositeIdentifierOfTermOfFocus,
        {
            type: ResourceType.book,
            id: connectedBook.id,
        },
        '421'
    ),
    // Reverse the role of the term of focus to make sure it is still found
    buildDummyDualEdgeConnection(
        {
            type: ResourceType.book,
            id: connectedTerm.id,
        },
        compositeIdentifierOfTermOfFocus,
        '457'
    ),
    buildDummyDualEdgeConnection(
        compositeIdentifierOfTermOfFocus,
        {
            type: ResourceType.book,
            id: connectedSpatialFeature.id,
        },
        '511'
    ),
];

const allConnections = [selfNoteForTerm, ...dualConnections];

const noteEndpoint = `${getConfig().apiUrl}/connections/notes`;

const termEndpoint = `${getConfig().apiUrl}/resources/terms`;

const bookEndpoint = `${getConfig().apiUrl}/resources/books`;

const spatialFeatureEndpoint = `${getConfig().apiUrl}/resources/spatialFeatures`;

const act = () =>
    renderWithProviders(
        <ConnectedResourcesPanel compositeIdentifier={compositeIdentifierOfTermOfFocus} />
    );

const handlers = [
    ...(
        [
            [dummyTerms, termEndpoint],
            [[connectedBook], bookEndpoint],
            [[connectedSpatialFeature], spatialFeatureEndpoint],
        ] as [IBaseViewModel[], string][]
    ).map(([resourceArray, endpoint]) =>
        buildMockSuccessfulGETHandler({
            endpoint,
            response: buildMockIndexResponse(
                resourceArray.map((item) => [item, []]),
                []
            ),
        })
    ),
    buildMockSuccessfulGETHandler({ endpoint: noteEndpoint, response: allConnections }),
];

describe('Connected Resources flow', () => {
    setupTestServer(...handlers);
    describe('when the API requests are valid', () => {
        act();

        it('should render the connected resources panel', async () => {
            await assertElementWithTestIdOnScreen('bob');
        });

        (
            [
                [connectedTerm, ResourceType.term],
                [connectedBook, ResourceType.book],
                [connectedSpatialFeature, ResourceType.spatialFeature],
            ] as [IBaseViewModel, ResourceType][]
        ).forEach(([{ id }, resourceType]) => {
            it(`should render a detail view of the connected resource: ${resourceType}/${id}`, async () => {
                await assertElementWithTestIdOnScreen(id);
            });
        });
    });
});
