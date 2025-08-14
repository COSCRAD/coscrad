import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';

export class MemoryMatchCard {
    sequenceNumber: number;
    imageId?: AggregateId;
    audioId?: AggregateId;
    text?: MultilingualText;
    // sources: ResourceCompositeIdentifer[]

    hasImage() {
        return !isNullOrUndefined(this.imageId);
    }

    hasAudio() {
        return !isNullOrUndefined(this.audioId);
    }

    hasText() {
        return !isNullOrUndefined(this.text);
    }
}
