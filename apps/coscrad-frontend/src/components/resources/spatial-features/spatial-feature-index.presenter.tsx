import { ResourceType } from '@coscrad/api-interfaces';
import { CoscradMainContentContainer } from 'apps/coscrad-frontend/src/utils/generic-components/style-components/coscrad-main-content-container';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import { ConnectedResourcesPanel } from '../../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../../store/slices/resources/shared/notes-for-resource';
import { ICoscradMap, SpatialFeatureDetailPresenter } from './map';
import { Position2D } from './types';

type SpatialFeatureIndexPresenterProps = SpatialFeatureIndexState & {
    MapComponent: ICoscradMap;
    initialCentre?: Position2D;
    initialZoom?: number;
    DetailPresenter: SpatialFeatureDetailPresenter;
};

/**
 * TODO [https://www.pivotaltracker.com/story/show/183681839]
 * We may some day read the actions and allow for bulk command execution in
 * an index view.
 */
export const SpatialFeatureIndexPresenter = ({
    entities: spatialFeatures,
    MapComponent,
    initialCentre,
    initialZoom,
    DetailPresenter,
}: SpatialFeatureIndexPresenterProps) => {
    const [selectedSpatialFeatureId, setSelectedSpatialFeatureId] = useState<string>(null);

    return (
        <>
            <MapComponent
                spatialFeatures={spatialFeatures}
                initialCentre={initialCentre}
                initialZoom={initialZoom}
                onSpatialFeatureSelected={(id: string) => setSelectedSpatialFeatureId(id)}
                DetailPresenter={DetailPresenter}
                selectedSpatialFeatureId={selectedSpatialFeatureId}
            />

            <CoscradMainContentContainer>
                <ConnectedResourcesPanel
                    compositeIdentifier={{
                        type: ResourceType.spatialFeature,
                        id: selectedSpatialFeatureId,
                    }}
                />
                <SelfNotesPanelContainer
                    compositeIdentifier={{
                        type: ResourceType.spatialFeature,
                        id: selectedSpatialFeatureId,
                    }}
                />
            </CoscradMainContentContainer>
        </>
    );
};
