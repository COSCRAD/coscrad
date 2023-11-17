import { IMultilingualText } from './multilingual-text';

export interface ITranscriptItem {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: IMultilingualText;
    speakerInitials: string;
}
