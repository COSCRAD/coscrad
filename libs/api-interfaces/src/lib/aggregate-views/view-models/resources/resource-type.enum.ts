export enum ResourceType {
    audioItem = 'audioItem',
    bibliographicCitation = 'bibliographicCitation',
    digitalText = 'digitalText',
    map = 'map',
    mediaItem = 'mediaItem',
    photograph = 'photograph',
    playlist = 'playlist',
    song = 'song',
    spatialFeature = 'spatialFeature',
    term = 'term',
    video = 'video',
    vocabularyList = 'vocabularyList',
}

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(ResourceType).includes(input as ResourceType);
