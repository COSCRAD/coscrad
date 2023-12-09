export const calculatePercentProgress = (currentTime: number, duration: number) => {
    return (currentTime / duration) * 100;
};
