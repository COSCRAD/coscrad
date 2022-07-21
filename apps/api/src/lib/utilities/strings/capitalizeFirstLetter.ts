export default (inputString: string): string =>
    inputString.length === 0
        ? inputString
        : inputString.charAt(0).toUpperCase() + inputString.slice(1);
