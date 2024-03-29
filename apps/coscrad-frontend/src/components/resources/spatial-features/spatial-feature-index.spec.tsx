import {
    AggregateType,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    INoteViewModel,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildDummyNotes, buildMemberWithGeneralContext } from '../../notes/test-utils';
import { ICoscradMap } from './map';
import { SpatialFeatureIndexContainer } from './spatial-feature-index.container';
import { SpatialFeatureIndexPresenter } from './spatial-feature-index.presenter';
import { buildDummySpatialFeatures } from './test-utils/build-dummy-spatial-features';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';

const MockMap: ICoscradMap = ({ spatialFeatures }) => (
    <div>
        {spatialFeatures.map(({ id }) => (
            <div
                data-testid={buildDataAttributeForAggregateDetailComponent(
                    AggregateType.spatialFeature,
                    id
                )}
                key={id}
            ></div>
        ))}
    </div>
);

const MockSpatialFeatureIndexPresenter = (indexResult: SpatialFeatureIndexState): JSX.Element => (
    <SpatialFeatureIndexPresenter
        {...indexResult}
        MapComponent={MockMap}
        DetailPresenter={SpatialFeatureDetailThumbnailPresenter}
    />
);

const dummySpatialFeatures = buildDummySpatialFeatures();

const member1 = buildMemberWithGeneralContext(
    {
        type: ResourceType.spatialFeature,
        id: dummySpatialFeatures[0].id,
    },
    EdgeConnectionMemberRole.self
);

const member2 = buildMemberWithGeneralContext(
    {
        type: ResourceType.spatialFeature,
        id: dummySpatialFeatures[1].id,
    },
    EdgeConnectionMemberRole.self
);

const selfNote: INoteViewModel = {
    connectionType: EdgeConnectionType.self,
    id: '332',
    note: {
        items: [
            {
                role: MultilingualTextItemRole.original,
                text: 'cool place to be in the summer',
                languageCode: LanguageCode.English,
            },
        ],
    },
    name: {
        items: [
            {
                role: MultilingualTextItemRole.original,
                text: 'cool place to be in the summer',
                languageCode: LanguageCode.English,
            },
        ],
    },
    connectedResources: [member1],
};

const dualNote: INoteViewModel = {
    connectionType: EdgeConnectionType.dual,
    id: '353',
    note: {
        items: [
            {
                role: MultilingualTextItemRole.original,
                text: 'these places are mentioned in the same story',
                languageCode: LanguageCode.English,
            },
        ],
    },
    name: {
        items: [
            {
                role: MultilingualTextItemRole.original,
                text: 'these places are mentioned in the same story',
                languageCode: LanguageCode.English,
            },
        ],
    },
    connectedResources: [member1, member2],
};

const notes = [...buildDummyNotes(), selfNote, dualNote];

const { apiUrl } = getConfig();

const endpoint = `${apiUrl}/resources/spatialFeatures`;

const notesEndpoint = `${apiUrl}/connections/notes`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <SpatialFeatureIndexContainer
                SpatialFeatureIndexPresenter={MockSpatialFeatureIndexPresenter}
            />
        </MemoryRouter>
    );

const mockSuccessfulGetNotesHandler = buildMockSuccessfulGETHandler({
    endpoint: notesEndpoint,
    response: notes,
});

describe('Spatial Feature Index', () => {
    describe(`when the API request succeeds`, () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummySpatialFeatures.map((feature) => [feature, []]),
                    []
                ),
            }),
            mockSuccessfulGetNotesHandler
        );

        it('should display the spatial features', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(
                dummySpatialFeatures,
                AggregateType.spatialFeature
            );
        });
    });

    describe('when the API request has failed or is in progress', () => {
        testContainerComponentErrorHandling(act, endpoint, mockSuccessfulGetNotesHandler);
    });
});
