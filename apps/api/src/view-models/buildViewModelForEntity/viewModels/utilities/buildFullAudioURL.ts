export default (baseAudioURL: string, filename: string, extension = 'mp3'): string => {
    return `${baseAudioURL}${filename}.${extension}`;
};
