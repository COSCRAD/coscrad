import { isEnum } from 'class-validator';

export enum MIMEType {
    mp3 = 'audio/mpeg',
    mp4 = 'video/mp4',
}

export const isMIMEType = (input: unknown) => isEnum(input, MIMEType);
