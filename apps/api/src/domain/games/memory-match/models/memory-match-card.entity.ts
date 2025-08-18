import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import {
    MissingAudioForMemoryMatchCardError,
    MissingImageForMemoryMatchCardError,
} from '../errors';

export class MemoryMatchCard {
    sequenceNumber: number;
    imageId?: AggregateId;
    audioId?: AggregateId;
    text?: MultilingualText; // build empty by default ?
    // sources: ResourceCompositeIdentifer[]

    constructor({
        sequenceNumber,
        imageId,
        audioId,
        text: textDto,
    }: DeepPartial<DTO<MemoryMatchCard>>) {
        this.sequenceNumber = sequenceNumber;

        this.imageId = imageId;

        this.audioId = audioId;

        if (isNonEmptyObject(textDto)) {
            // we are programming the card \ round to a `DeepPartial` DTO, unlike `MultilingualText`
            this.text = new MultilingualText(textDto as DTO<MultilingualText>);
        }
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

    validatePubicationStatus(): InternalError[] {
        const allErrors = [];

        if (!this.hasImage()) {
            allErrors.push(new MissingImageForMemoryMatchCardError(this.sequenceNumber));
        }

        if (!this.hasAudio()) {
            allErrors.push(new MissingAudioForMemoryMatchCardError(this.sequenceNumber));
        }

        return allErrors;
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
