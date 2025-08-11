import { IMultilingualText, ResourceCompositeIdentifier } from '../../resources';

export interface IMemoryMatchCard {
    sequenceNumber: string; // this will be a sequential ID
    audioUrl: string;
    imageUrl: string;
    text?: IMultilingualText;
    sources?: ResourceCompositeIdentifier[];
}
