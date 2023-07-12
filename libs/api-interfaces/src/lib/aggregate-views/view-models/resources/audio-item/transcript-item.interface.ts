import { IMultilingualText } from './multilingual-text.interface';

export interface ITranscriptItem {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: IMultilingualText;
    speakerInitials: string;
}
