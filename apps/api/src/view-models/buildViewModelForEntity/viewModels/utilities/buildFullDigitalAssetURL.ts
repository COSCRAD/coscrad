export default (baseURL: string, filename: string, extension = 'mp3'): string => {
    return `${baseURL}${filename}.${extension}`;
};
