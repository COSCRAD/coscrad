export const truncateText = (text: string, maxNumberOfChars: number): string =>
    text.length > maxNumberOfChars ? `${text.slice(0, maxNumberOfChars)}...` : text;
