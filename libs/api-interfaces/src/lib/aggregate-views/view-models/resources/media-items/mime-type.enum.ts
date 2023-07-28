// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export enum MIMEType {
    // images
    png = 'image/png',
    // audio
    mp3 = 'audio/mpeg',
    // TODO change this to audio/wav. This requires a migration
    wav = 'audio/x-wav',
    audioOgg = 'audio/ogg',
    // video
    mp4 = 'video/mp4',
    videoOgg = 'video/ogg',
    videoWebm = 'video/webm',
}
