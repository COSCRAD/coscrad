import { Position2D } from '../types';

/**
 * NOTE: for some reason, Leaflet requires a height to be set for the map,
 * but not the width.
 * It seems like using an SCSS module, you can't target the Leaflet map .leaflet-container
 * CSS class to override the height.  We may want to have height and width set
 * by a property on the component.
 */
export const MAP_DIV_WIDTH = '800px';

export const MAP_DIV_HEIGHT = '600px';

export const INITIAL_CENTRE = [53.232942164270135, -127.70090919382334] as Position2D;

export const INITIAL_ZOOM = 6;
