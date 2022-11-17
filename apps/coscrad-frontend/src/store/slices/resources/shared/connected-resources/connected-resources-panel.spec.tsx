import {
    EdgeConnectionMemberRole,
    IBaseViewModel,
    INoteViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import {
    buildDummyDualEdgeConnection,
    buildDummyNotes,
    buildMemberWithGeneralContext,
} from '../../../../../components/notes/test-utils';
import { buildDummyBooks } from '../../../../../components/resources/books/test-utils/build-dummy-books';
import { buildDummySpatialFeatures } from '../../../../../components/resources/spatial-features/test-utils/build-dummy-spatial-features';
import { buildDummyTerms } from '../../../../../components/resources/terms/test-utils/build-dummy-terms';
import { getConfig } from '../../../../../config';
import {
    assertElementWithTestIdOnScreen,
    renderWithProviders,
} from '../../../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../../../utils/test-utils/test-data';
import { ConnectedResourcesPanel } from './connected-resources-panel';

const dummyTerms = buildDummyTerms();

const termOfFocus = dummyTerms[0];

const compositeIdentifierOfTermOfFocus = {
    type: ResourceType.term,
    id: termOfFocus.id,
};

const dummyNotes = [...buildDummyNotes()];

const noteEndpoint = `${getConfig().apiUrl}/connections/notes`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <ConnectedResourcesPanel compositeIdentifier={compositeIdentifierOfTermOfFocus} />
        </MemoryRouter>
    );

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
            type: ResourceType.term,
            id: connectedTerm.id,
        },
        compositeIdentifierOfTermOfFocus,
        '457'
    ),
    buildDummyDualEdgeConnection(
        compositeIdentifierOfTermOfFocus,
        {
            type: ResourceType.spatialFeature,
            id: connectedSpatialFeature.id,
        },
        '511'
    ),
];

const allConnections = [selfNoteForTerm, ...dualConnections];

const termEndpoint = `${getConfig().apiUrl}/resources/terms`;

const bookEndpoint = `${getConfig().apiUrl}/resources/books`;

const spatialFeatureEndpoint = `${getConfig().apiUrl}/resources/spatialFeatures`;

describe(`NoteIndex`, () => {
    describe('when the API request is valid', () => {
        describe('when there are no connections to the resource of focus', () => {
            setupTestServer(
                buildMockSuccessfulGETHandler({
                    endpoint: noteEndpoint,
                    response: dummyNotes,
                })
            );

            it('should render the connected resources pannel', async () => {
                act();

                // TODO remove magic string
                await assertElementWithTestIdOnScreen('connectedResourcesPanel');
            });
        });

        describe('when there are several connections to the resource of focus', () => {
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

            setupTestServer(...handlers);

            it('should render the connected resources pannel', async () => {
                act();

                // TODO remove magic string
                await assertElementWithTestIdOnScreen('connectedResourcesPanel');
            });

            (
                [
                    [connectedTerm, ResourceType.term],
                    [connectedBook, ResourceType.book],
                    [connectedSpatialFeature, ResourceType.spatialFeature],
                ] as [IBaseViewModel, ResourceType][]
            ).forEach(([{ id }, resourceType]) => {
                it(`should render a detail view of the connected resource: ${resourceType}/${id}`, async () => {
                    act();

                    await assertElementWithTestIdOnScreen(id);
                });
            });
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, noteEndpoint);
    });
});
