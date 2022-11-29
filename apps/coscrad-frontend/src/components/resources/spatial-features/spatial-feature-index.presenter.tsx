/**
 * This is an attempted fix from: https://stackoverflow.com/a/59523791
 * For some reason the shadow of the place marker is a broken image link
 */
import { ResourceType } from '@coscrad/api-interfaces';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import { ConnectedResourcesPanel } from '../../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../../store/slices/resources/shared/notes-for-resource';
import { ICoscradMap, SpatialFeatureDetailPresenter } from './map';
import './spatial-feature-index.presenter.css';

type SpatialFeatureIndexPresenterProps = SpatialFeatureIndexState & {
    onSpatialFeatureSelected?: () => void;
    MapComponent: ICoscradMap;
    initialCentre?: [number, number];
    initialZoom?: number;
    DetailPresenter: SpatialFeatureDetailPresenter;
};

/**
 * We may want to wrap leaflet behind our own API and inject it here.
 * TODO [https://www.pivotaltracker.com/story/show/183681839]
 * We may some day read the actions and allow for bulk command execution in
 * an index view.
 */
export const SpatialFeatureIndexPresenter = ({
    data: detailResult,
    MapComponent,
    initialCentre,
    initialZoom,
    DetailPresenter,
}: SpatialFeatureIndexPresenterProps) => {
    const [selectedSpatialFeatureId, setSelectedSpatialFeatureId] = useState<string>(null);

    const spatialFeatures = detailResult.map(({ data }) => data);

    return (
        <div>
            <MapComponent
                spatialFeatures={spatialFeatures}
                initialCentre={initialCentre}
                initialZoom={initialZoom}
                onSpatialFeatureSelected={(id: string) => setSelectedSpatialFeatureId(id)}
                DetailPresenter={DetailPresenter}
            />

            <div>
                Selected Id: {selectedSpatialFeatureId}
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
            </div>
        </div>
    );
};
