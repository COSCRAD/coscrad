import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType, NonNegativeFiniteNumber, UUID } from '@coscrad/data-types';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { AggregateId } from '../../../types/AggregateId';
import {
    MissingAudioForMemoryMatchCardError,
    MissingImageForMemoryMatchCardError,
} from '../errors';

@CoscradDataExample<MemoryMatchCard>({
    example: {
        sequenceNumber: 1,
        imageId: buildDummyUuid(1),
        audioId: buildDummyUuid(2),
        // you must add text if needed
    },
})
export class MemoryMatchCard {
    // TODO `@SequentialId`
    @NonNegativeFiniteNumber({
        label: 'sequence number',
        description: 'uniquely identifies a pair of matching cards',
    })
    sequenceNumber: number;

    @UUID({
        label: 'image ID',
        description: 'system reference to the image for this memory match card',
        isOptional: true,
    })
    imageId?: AggregateId;

    @UUID({
        label: 'audio ID',
        description: 'system reference to the audio for this memory match card',
        isOptional: true,
    })
    audioId?: AggregateId;

    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'text to appear on the card',
        isOptional: true,
    })
    text?: MultilingualText; // build empty by default ?
    // sources: ResourceCompositeIdentifer[]

    constructor(dto: DeepPartial<DTO<MemoryMatchCard>>) {
        if (!dto) {
            return;
        }

        const { sequenceNumber, imageId, audioId, text: textDto } = dto;

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

    public static fromDto(dto: DTO<MemoryMatchCard>) {
        return new MemoryMatchCard(dto);
    }
}
