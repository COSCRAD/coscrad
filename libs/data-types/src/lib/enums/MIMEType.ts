import { isEnum } from '@coscrad/validation';

export enum MIMEType {
    mp3 = 'audio/mpeg',
    mp4 = 'video/mp4',
}

export const isMIMEType = (input: unknown): input is MIMEType => isEnum(input, MIMEType);
