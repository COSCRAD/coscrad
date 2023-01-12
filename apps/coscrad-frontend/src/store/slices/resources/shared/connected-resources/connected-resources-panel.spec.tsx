import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IBaseViewModel,
    INoteViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { waitFor } from '@testing-library/react';
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
import { TestId } from '../../../../../utils/test-utils/constants';
import { setupTestServer } from '../../../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../../../utils/test-utils/test-data';
import { ConnectedResourcesPanel } from './connected-resources-panel';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const config = getConfig();

const dummyTerms = buildDummyTerms();

const termOfFocus = dummyTerms[0];

const compositeIdentifierOfTermOfFocus = {
    type: ResourceType.term,
    id: termOfFocus.id,
};

const dummyNotes = buildDummyNotes();

const noteEndpoint = `${config.apiUrl}/connections/notes`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <ConnectedResourcesPanel compositeIdentifier={compositeIdentifierOfTermOfFocus} />
        </MemoryRouter>
    );

const connectedTerm = dummyTerms[1];

const connectedBook = buildDummyBooks()[0];

const connectedSpatialFeature = buildDummySpatialFeatures()[0];
/**
 * Be sure to update this test to work on the new approach.
 */
// Make sure that self connections do not come through
const selfNoteForTerm: INoteViewModel = {
    connectionType: EdgeConnectionType.self,
    id: '334',
    note: 'this part is epic',
    connectedResources: [
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

const termEndpoint = `${config.apiUrl}/resources/terms`;

const bookEndpoint = `${config.apiUrl}/resources/books`;

const spatialFeatureEndpoint = `${config.apiUrl}/resources/spatialFeatures`;

const CONNECTED_RESOURCES_PANEL_TEST_ID = 'connectedResourcesPanel';

describe(`Connected Resources Panel`, () => {
    describe('when the API request is valid', () => {
        describe('when there are no connections to the resource of focus', () => {
            setupTestServer(
                buildMockSuccessfulGETHandler({
                    endpoint: noteEndpoint,
                    response: buildMockIndexResponse(
                        dummyNotes.map((note) => [note, []]),
                        []
                    ),
                })
            );

            it('should render the connected resources pannel', async () => {
                act();

                await assertElementWithTestIdOnScreen(CONNECTED_RESOURCES_PANEL_TEST_ID);
            });
        });

        describe('when there are several connections to the resource of focus', () => {
            const handlers = [
                .../**
                 * Each tuple has an array of view models to be returned and
                 * the endpoint. We then map to wrap each array of view models
                 * in the `IIndexQueryResult` data structure.
                 */
                (
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
                buildMockSuccessfulGETHandler({
                    endpoint: noteEndpoint,
                    response: buildMockIndexResponse(
                        allConnections.map((connection) => [connection, []]),
                        []
                    ),
                }),
            ];

            setupTestServer(...handlers);

            it('should render the connected resources pannel', async () => {
                act();

                await assertElementWithTestIdOnScreen(CONNECTED_RESOURCES_PANEL_TEST_ID);
            });

            /**
             * We check that each resource that is connected to the term of focus
             * is rendered.
             */
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

            it('should not render self-notes', async () => {
                const { queryByTestId } = act();

                await waitFor(() => {
                    expect(queryByTestId(TestId.loading)).toBeNull();

                    expect(queryByTestId(TestId.error)).toBeNull();

                    expect(queryByTestId(selfNoteForTerm.id)).toBeNull();
                });
            });
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, noteEndpoint);
    });
});
