import { ITranscriptItem } from './transcript-item.interface';
import { ITranscriptParticipant } from './transcript-participant.interface';

export interface ITranscript {
    participants: ITranscriptParticipant[];

    items: ITranscriptItem[];
}
