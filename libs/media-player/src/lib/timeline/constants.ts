export const ZOOM_FACTOR = 3;

export const EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS = 40;

export const RULER_HEIGHT_IN_PIXELS = 30;

export const RULER_TICK_WIDTH_IN_PIXELS = 1;

export const RULER_TICK_HEIGHT_IN_PIXELS = 10;

export const RULER_TICK_WITH_NUMBER_HEIGHT_IN_PIXELS = 20;

/**
 * This limitation is from the IE 9 / 10 (Win) implementation of Canvas
 * https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 */
export const MAX_CANVAS_WIDTH_IN_PIXELS = 8000;

type ZoomLevels = {
    rulerTickXCoordinateOffset: number;
    rulerTickFrequencyInSeconds: number;
    timecodeDisplayFrequencyInSeconds: number;
};

export const ZOOM_LEVELS: ZoomLevels[] = [
    // 0
    {
        rulerTickXCoordinateOffset: 40,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 1
    {
        rulerTickXCoordinateOffset: 20,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 2
    {
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 3
    {
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 5,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 4
    {
        rulerTickXCoordinateOffset: 5,
        rulerTickFrequencyInSeconds: 10,
        timecodeDisplayFrequencyInSeconds: 10,
    },
    // 5
    {
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 1,
        timecodeDisplayFrequencyInSeconds: 20,
    },
];
