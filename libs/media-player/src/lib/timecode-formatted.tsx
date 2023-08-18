interface MediaCurrentTimeFormattedProps {
    mediaCurrentTime: number;
}

export const MediaCurrentTimeFormatted = ({
    mediaCurrentTime,
}: MediaCurrentTimeFormattedProps): JSX.Element => {
    const hourInSeconds = 3600;

    const hours =
        mediaCurrentTime >= hourInSeconds ? Math.floor(mediaCurrentTime / hourInSeconds) : 0;

    const hoursString = hours > 9 ? hours.toString() : hours < 9 ? `0${hours}` : '00';

    const minutes =
        mediaCurrentTime >= hourInSeconds
            ? Math.floor(mediaCurrentTime - hours * hourInSeconds) / 60
            : Math.floor(mediaCurrentTime / 60);

    const minutesString = minutes > 9 ? minutes.toString() : `0${minutes}`;

    const seconds = Math.floor(mediaCurrentTime - hours * hourInSeconds - minutes * 60);

    const secondsString = seconds > 9 ? seconds.toString() : `0${seconds}`;

    const formattedTimeCode = `${hoursString}:${minutesString}:${secondsString}`;

    return <>{formattedTimeCode}</>;
};
