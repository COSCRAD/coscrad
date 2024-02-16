export const convertTimelineUnitsToTimecode = (
    timelineUnits: number,
    renderedTimelineLength: number,
    mediaDurationSeconds: number
) => {
    const timelineUnit = renderedTimelineLength / mediaDurationSeconds;

    return timelineUnits / timelineUnit;
};
