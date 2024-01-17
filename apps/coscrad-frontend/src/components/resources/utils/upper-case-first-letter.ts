// Share via lib to frontend and backend
export const upperCaseFirstLetter = (str: string) => {
    return str
        .split(' ')
        .map((word) => [word.charAt(0).toUpperCase(), word.slice(1)].join(''))
        .join(' ');
};
