export const EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS = 40;

export const RULER_HEIGHT_IN_PIXELS = 30;

export const RULER_TICK_WIDTH_IN_PIXELS = 1;

export const RULER_TICK_HEIGHT_IN_PIXELS = 10;

export const RULER_TICK_WITH_NUMBER_HEIGHT_IN_PIXELS = 20;

export const RULER_TICKS_AND_NUMBERS_COLOR = '#178e06';

/**
 * This limitation is from the IE 9 / 10 (Win) implementation of Canvas
 * https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 */
export const MAX_CANVAS_WIDTH_IN_PIXELS = 8000;

export type ZoomLevels = {
    zoomLevel: number;
    rulerTickXCoordinateOffset: number;
    rulerTickFrequencyInSeconds: number;
    timecodeDisplayFrequencyInSeconds: number;
};

// re-order zoom levels - 0 is deep zoom, highest is most zoomed out
// How to dynamically zoom to level where whole timeline is in view
export const ZOOM_LEVELS: ZoomLevels[] = [
    // 0
    {
        zoomLevel: 0,
        rulerTickXCoordinateOffset: 40,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 1
    {
        zoomLevel: 1,
        rulerTickXCoordinateOffset: 20,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 2
    {
        zoomLevel: 2,
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 3
    {
        zoomLevel: 3,
        rulerTickXCoordinateOffset: 40,
        rulerTickFrequencyInSeconds: 5,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 4
    {
        zoomLevel: 4,
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 20,
    },
    // 5
    {
        zoomLevel: 5,
        rulerTickXCoordinateOffset: 40,
        rulerTickFrequencyInSeconds: 5,
        timecodeDisplayFrequencyInSeconds: 10,
    },
];
