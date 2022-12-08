export enum ResourceType {
    term = 'term',
    vocabularyList = 'vocabularyList',
    transcribedAudio = 'transcribedAudio',
    book = 'book',
    photograph = 'photograph',
    spatialFeature = 'spatialFeature',
    bibliographicReference = 'bibliographicReference',
    song = 'song',
    mediaItem = 'mediaItem',
}

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(ResourceType).includes(input as ResourceType);
