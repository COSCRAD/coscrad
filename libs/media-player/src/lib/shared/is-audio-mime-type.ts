import { AudioMIMEType } from './audio-mime-type.enum';

export const isAudioMIMEType = (input: unknown): input is AudioMIMEType =>
    Object.values(AudioMIMEType).some((value) => value === (input as AudioMIMEType));
