import { ZOOM_LEVELS } from './constants';

export const getZoomLevelConfig = (zoomLevel: number) => {
    return ZOOM_LEVELS[zoomLevel];
};
