export const convertTimecodeToTimelineUnits = (
    renderedTimelineLength: number,
    timecodeInSeconds: number,
    mediaDurationSeconds: number
) => {
    const timelineUnit = renderedTimelineLength / mediaDurationSeconds;

    return timecodeInSeconds * timelineUnit;
};
