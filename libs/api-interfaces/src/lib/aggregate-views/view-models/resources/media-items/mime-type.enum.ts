// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export enum MIMEType {
    // documents
    pdf = 'application/pdf',
    csv = 'text/csv',
    xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // doc = 'application/msword',
    docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // ppt = 'application/vnd.ms-powerpoint',
    pptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // images
    png = 'image/png',
    bmp = 'image/bmp',
    // // also for `jpeg`
    jpg = 'image/jpeg',
    svg = 'image/svg+xml',
    // audio
    mp3 = 'audio/mpeg',
    wav = 'audio/wav',
    audioOgg = 'audio/ogg',
    // video
    mp4 = 'video/mp4',
    videoOgg = 'video/ogg',
    videoWebm = 'video/webm',
    mov = 'mov',
}
