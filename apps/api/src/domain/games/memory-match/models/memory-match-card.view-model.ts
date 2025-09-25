import { NestedDataType, PositiveInteger, URL } from '@coscrad/data-types';
import { isNonEmptyObject, isNonEmptyString } from '@coscrad/validation-constraints';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { MemoryMatchCard } from './memory-match-card.entity';

interface UrlBuilder {
    build(mediaItemId: string): string;
}

export class MemoryMatchCardViewModel {
    @PositiveInteger({
        label: 'sequence number',
        description: 'uniquely identifies a pair of matching cards',
    })
    sequenceNumber: number;

    @URL({
        label: 'audio URL',
        description: 'a link to the audio that plays when this card is uncovered',
    })
    audioUrl: string;

    @URL({
        label: 'image URL',
        description: 'a link to the image that shows when this card is face up',
    })
    imageUrl: string;

    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'text to appear on the front of this card',
        isOptional: true,
    })
    text?: MultilingualText;
    // TODO return the sources
    // sources?: ResourceCompositeIdentifier[];

    constructor(dto: DTO<MemoryMatchCard>, urlBuilder: UrlBuilder) {
        if (!dto) return;

        const { sequenceNumber, audioId, imageId, text } = dto;

        this.sequenceNumber = sequenceNumber;

        if (isNonEmptyString(audioId)) {
            this.audioUrl = urlBuilder.build(audioId);
        }

        if (isNonEmptyString(imageId)) {
            this.imageUrl = urlBuilder.build(imageId);
        }

        if (isNonEmptyObject(text)) {
            this.text = new MultilingualText(text);
        }
    }
}
