import { IMultilingualText } from '../common';

export interface ITranscriptItem {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: IMultilingualText;
    speakerInitials: string;
}
