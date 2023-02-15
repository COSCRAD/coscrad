import { IMultilingualText } from './multilingual-text.interface';

export interface ITranscriptItem {
    inPoint: number;
    outPoint: number;
    text: IMultilingualText;
    speakerInitials: string;
}
