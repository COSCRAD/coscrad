import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';

export class MemoryMatchCard {
    sequenceNumber: number;
    imageId: AggregateId;
    audioId: AggregateId;
    text?: MultilingualText;
    // sources: ResourceCompositeIdentifer[]
}
