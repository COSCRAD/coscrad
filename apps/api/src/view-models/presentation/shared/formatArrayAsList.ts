type Renderer<T> = (dataToFormatAsString: T) => string;

const defaultRenderer = <T>(x: T): string => `${x}`;

export default <T>(input: T[], render: Renderer<T> = defaultRenderer): string => {
    if (input.length === 0) return ``;

    return (
        input
            .reduce(
                (accumulatedString, element) => accumulatedString.concat(render(element), ','),
                ''
            )
            // Remove trailing ','
            .slice(0, -1)
    );
};
