import { ResourceType } from '@coscrad/api-interfaces';
import { useState } from 'react';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import { ConnectedResources } from '../../../store/slices/resources/shared/connected-resources';
import { SelfNotesContainer } from '../../../store/slices/resources/shared/notes-for-resource';
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

            <>
                <ConnectedResources
                    compositeIdentifier={{
                        type: ResourceType.spatialFeature,
                        id: selectedSpatialFeatureId,
                    }}
                />
                <SelfNotesContainer
                    compositeIdentifier={{
                        type: ResourceType.spatialFeature,
                        id: selectedSpatialFeatureId,
                    }}
                />
            </>
        </>
    );
};
