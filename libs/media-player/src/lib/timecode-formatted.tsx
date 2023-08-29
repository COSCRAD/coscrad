interface MediaCurrentTimeFormattedProps {
    timeCode: number;
}

export const TimeCodeFormatted = ({ timeCode }: MediaCurrentTimeFormattedProps): JSX.Element => {
    const hourInSeconds = 3600;

    const hours = timeCode >= hourInSeconds ? Math.floor(timeCode / hourInSeconds) : 0;

    const hoursString = hours > 9 ? hours.toString() : hours < 9 ? `0${hours}` : '00';

    const minutes =
        timeCode >= hourInSeconds
            ? Math.floor(timeCode - hours * hourInSeconds) / 60
            : Math.floor(timeCode / 60);

    const minutesString = minutes > 9 ? minutes.toString() : `0${minutes}`;

    const seconds = Math.floor(timeCode - hours * hourInSeconds - minutes * 60);

    const secondsString = seconds > 9 ? seconds.toString() : `0${seconds}`;

    const formattedTimeCode = `${hoursString}:${minutesString}:${secondsString}`;

    return <>{formattedTimeCode}</>;
};
