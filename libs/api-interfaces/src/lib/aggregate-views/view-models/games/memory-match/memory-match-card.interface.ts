import { IMultilingualText } from '../../resources';

export interface IMemoryMatchCard {
    sequenceNumber: number; // this will be a sequential ID
    audioUrl?: string;
    imageUrl?: string;
    text?: IMultilingualText;
    // sources?: ResourceCompositeIdentifier[];
}
