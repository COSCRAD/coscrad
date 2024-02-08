export const calculatePositionAsPercentage = (
    timelinePosition: number,
    mediaDurationSeconds: number
) => {
    return (timelinePosition / mediaDurationSeconds) * 100;
};
