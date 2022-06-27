import { isEnum } from 'class-validator';

export enum MIMEType {
    mp3 = 'audio/mpeg',
}

export const isMIMEType = (input: unknown) => isEnum(input, MIMEType);
