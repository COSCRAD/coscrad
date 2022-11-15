/**
 * If we ever move to code sharing with mobile, we may want the full and thumbnail
 * variations to be part of a single abstract factory for the same `platform`.
 */
export enum DetailPresenterFormat {
    fullWeb = 'fullWeb',
    webThumbnail = 'webThumbnail',
}
