/**
 * This is an attempted fix from: https://stackoverflow.com/a/59523791
 * For some reason the shadow of the place marker is a broken image link
 */
import { ResourceType } from '@coscrad/api-interfaces';
import { IconButton } from '@mui/material';
// import 'leaflet/dist/images/marker-shadow.png';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import 'leaflet/dist/leaflet.css';
import { useCallback, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import { ConnectedResourcesPanel } from '../../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../../store/slices/resources/shared/notes-for-resource';
import { ICoscradMap, SpatialFeatureDetailPresenter } from './map';
import styles from './spatial-feature-index.presenter.module.scss';
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
    const fullScreenHandle = useFullScreenHandle();
    const [screenState, setScreenState] = useState(false);

    const fullScreenChange = useCallback(
        (state) => {
            setScreenState(state);
            console.log({ screenState });
        },
        [fullScreenHandle]
    );

    return (
        <div>
            <FullScreen
                className={styles['full-screen-map-container']}
                handle={fullScreenHandle}
                onChange={fullScreenChange}
            >
                <div className={styles['map-actions']}>
                    {!screenState && (
                        <IconButton onClick={fullScreenHandle.enter}>
                            <FullscreenIcon />
                        </IconButton>
                    )}
                    {screenState && (
                        <IconButton onClick={fullScreenHandle.exit}>
                            <FullscreenExitIcon />
                        </IconButton>
                    )}
                </div>
                <MapComponent
                    mapDivWidth={'100%'}
                    mapDivHeight={'100%'}
                    spatialFeatures={spatialFeatures}
                    initialCentre={initialCentre}
                    initialZoom={initialZoom}
                    onSpatialFeatureSelected={(id: string) => setSelectedSpatialFeatureId(id)}
                    DetailPresenter={DetailPresenter}
                    selectedSpatialFeatureId={selectedSpatialFeatureId}
                />
            </FullScreen>

            <div>
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
