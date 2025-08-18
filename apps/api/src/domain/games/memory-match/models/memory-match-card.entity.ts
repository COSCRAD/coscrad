import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';

export class MemoryMatchCard {
    sequenceNumber: number;
    imageId?: AggregateId;
    audioId?: AggregateId;
    text?: MultilingualText; // build empty by default ?
    // sources: ResourceCompositeIdentifer[]

    constructor({ sequenceNumber }: DeepPartial<DTO<MemoryMatchCard>>) {
        this.sequenceNumber = sequenceNumber;
    }

    hasImage() {
        return !isNullOrUndefined(this.imageId);
    }

    hasAudio() {
        ``;
        return !isNullOrUndefined(this.audioId);
    }

    hasText() {
        return !isNullOrUndefined(this.text);
    }

    addImage(mediaItemId: AggregateId): MemoryMatchCard {
        this.imageId = mediaItemId;

        return this;
    }

    // addAudio ?

    addText(text: string, languageCode: LanguageCode) {
        this.text = new MultilingualText({
            items: [
                new MultilingualTextItem({
                    text,
                    languageCode,
                    role: MultilingualTextItemRole.original,
                }),
            ],
        });
    }
}
