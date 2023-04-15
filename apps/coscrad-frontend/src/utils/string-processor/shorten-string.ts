export const shortenString = (text: string, maxNumberOfChars: number): string => {
    const shortenedString =
        text.length > maxNumberOfChars ? `${text.substring(0, maxNumberOfChars)}...` : text;

    return shortenedString;
};
