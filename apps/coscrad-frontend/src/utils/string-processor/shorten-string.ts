export const truncateText = (text: string, maxNumberOfChars: number): string => {
    if (text.length < maxNumberOfChars) return text;

    const splitText = text.slice(0, maxNumberOfChars).split(' ');

    splitText.pop();

    return `${splitText.join(' ')}...`;
};
