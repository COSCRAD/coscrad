export const renderMediaLengthInSeconds = (length): JSX.Element => {
    const lengthInSeconds = Math.round(length / 1000);

    return <div>{lengthInSeconds} Sec</div>;
};
