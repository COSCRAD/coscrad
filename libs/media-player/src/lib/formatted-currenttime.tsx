import { asTwoDigitString } from './as-two-digit-string';

interface FormattedMediaTimeProps {
    timeInSeconds: number;
}

export const FormattedMediaTime = ({ timeInSeconds }: FormattedMediaTimeProps): JSX.Element => {
    const numberOfSecondsInHour = 3600;

    const hours =
        timeInSeconds >= numberOfSecondsInHour
            ? Math.floor(timeInSeconds / numberOfSecondsInHour)
            : 0;

    const minutes =
        timeInSeconds >= numberOfSecondsInHour
            ? Math.floor(timeInSeconds - hours * numberOfSecondsInHour) / 60
            : Math.floor(timeInSeconds / 60);

    const seconds = Math.floor(timeInSeconds - hours * numberOfSecondsInHour - minutes * 60);

    const formattedCurrentTime = [hours, minutes, seconds]
        .map((time) => asTwoDigitString(time))
        .join(':');

    // eslint-disable-next-line
    return <>{formattedCurrentTime}</>;
};
