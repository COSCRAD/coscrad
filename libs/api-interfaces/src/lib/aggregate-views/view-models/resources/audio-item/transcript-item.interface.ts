import { IMultiLingualText } from './multilingual-text.interface';

export interface ITranscriptItem {
    inPoint: number;
    outPoint: number;
    text: IMultiLingualText;
    speakerInitials: string;
}
