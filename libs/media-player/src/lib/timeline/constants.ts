export const ZOOM_FACTOR = 5;

export const EDITOR_SOUND_BAR_HEIGHT = 40;

export const RULER_HEIGHT = 30;

export const RULER_TICK_WIDTH = 1;

export const RULER_TICK_HEIGHT = 10;

export const RULER_TICK_WITH_NUMBER_HEIGHT = 20;

type ZoomLevels = {
    rulerTickXCoordinateOffset: number;
    rulerTickFrequencyInSeconds: number;
    numberFrequencyInSeconds: number;
};

export const ZOOM_LEVELS: ZoomLevels[] = [
    {
        rulerTickXCoordinateOffset: 40,
        rulerTickFrequencyInSeconds: 1,
        numberFrequencyInSeconds: 10,
    },
    {
        rulerTickXCoordinateOffset: 30,
        rulerTickFrequencyInSeconds: 1,
        numberFrequencyInSeconds: 10,
    },
    {
        rulerTickXCoordinateOffset: 20,
        rulerTickFrequencyInSeconds: 1,
        numberFrequencyInSeconds: 10,
    },
    {
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 1,
        numberFrequencyInSeconds: 10,
    },
    {
        rulerTickXCoordinateOffset: 20,
        rulerTickFrequencyInSeconds: 5,
        numberFrequencyInSeconds: 10,
    },
    {
        rulerTickXCoordinateOffset: 10,
        rulerTickFrequencyInSeconds: 1,
        numberFrequencyInSeconds: 20,
    },
];
