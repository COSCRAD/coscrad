export enum ResourceType {
    term = 'term',
    vocabularyList = 'vocabularyList',
    audioItem = 'audioItem',
    photograph = 'photograph',
    spatialFeature = 'spatialFeature',
    bibliographicCitation = 'bibliographicCitation',
    digitalText = 'digitalText',
    song = 'song',
    video = 'video',
    playlist = 'playlist',
}

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(ResourceType).includes(input as ResourceType);
