export enum ResourceType {
    term = 'term',
    vocabularyList = 'vocabularyList',
    audioItem = 'audioItem',
    book = 'book',
    photograph = 'photograph',
    spatialFeature = 'spatialFeature',
    bibliographicReference = 'bibliographicReference',
    song = 'song',
    mediaItem = 'mediaItem',
    video = 'video',
    playlist = 'playlist',
}

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(ResourceType).includes(input as ResourceType);
