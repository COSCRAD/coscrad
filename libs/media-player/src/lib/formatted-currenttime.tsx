import { asTwoDigitString } from './asTwoDigitString';

interface FormattedCurrentTimeProps {
    currentTimeInSeconds: number;
}

export const FormattedCurrentTime = ({
    currentTimeInSeconds,
}: FormattedCurrentTimeProps): JSX.Element => {
    const numberOfSecondsInHour = 3600;

    const hours =
        currentTimeInSeconds >= numberOfSecondsInHour
            ? Math.floor(currentTimeInSeconds / numberOfSecondsInHour)
            : 0;

    const minutes =
        currentTimeInSeconds >= numberOfSecondsInHour
            ? Math.floor(currentTimeInSeconds - hours * numberOfSecondsInHour) / 60
            : Math.floor(currentTimeInSeconds / 60);

    const seconds = Math.floor(currentTimeInSeconds - hours * numberOfSecondsInHour - minutes * 60);

    const formattedCurrentTime = [hours, minutes, seconds]
        .map((time) => asTwoDigitString(time))
        .join(':');

    return <>{formattedCurrentTime}</>;
};
