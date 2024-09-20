export const convertTimecodeToTimelineUnits = (
    rulerWidth: number,
    timecodeInSeconds: number,
    mediaDurationSeconds: number
) => {
    const timelineUnit = rulerWidth / mediaDurationSeconds;

    return timecodeInSeconds * timelineUnit;
};
