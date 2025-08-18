import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import {
    CannotOverwriteAudioForMemoryMatchCardError,
    CannotOverwriteCardbackImageForMemoryMatchRoundError,
    CannotOverwriteImageForMemoryMatchCardError,
    CannotOverwriteTextForMemoryMatchCardError,
    FailedToRepublishMemoryMatchRoundError,
    FailedToUnpublishDraftMemoryMatchRoundError,
    FailedToUpdateMissingMemoryMatchCardError,
    MemoryMatchRoundCapacityReachedError,
} from '../errors';
import { MemoryMatchCard } from './memory-match-card.entity';

// TODO make this configurable
const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

export class MemoryMatchRound {
    id: AggregateId;
    cardBackImageId: AggregateId;
    cards: MemoryMatchCard[];
    name: MultilingualText;
    description: MultilingualText;
    compiledBy: AggregateId[];
    contributors: AggregateId[];
    size: number = NUMBER_OF_PAIRS_IN_A_ROUND;
    isPublished = false;

    constructor(dto: DeepPartial<DTO<MemoryMatchRound>>) {
        if (!dto) return;

        const { id, cards } = dto;

        this.id = id;

        if (Array.isArray(cards)) {
            this.cards = cards.map((c) => new MemoryMatchCard(c));
        } else {
            this.cards = [];
        }
    }

    addCardbackImage(newMediaItemId: AggregateId): ResultOrError<MemoryMatchRound> {
        if (this.hasCardback()) {
            return new CannotOverwriteCardbackImageForMemoryMatchRoundError(
                this.id,
                this.cardBackImageId,
                newMediaItemId
            );
        }

        this.cardBackImageId = newMediaItemId;

        return this;
    }

    addCard(): ResultOrError<number> {
        const nextSequenceNumber = this.cards.length + 1;

        if (nextSequenceNumber > this.size) {
            return new MemoryMatchRoundCapacityReachedError(this.id, this.size);
        }

        this.cards.push(
            new MemoryMatchCard({
                sequenceNumber: nextSequenceNumber,
            })
        );

        return nextSequenceNumber;
    }

    addAudioForCard(
        cardSquenceNumber: number,
        mediaItemId: AggregateId
    ): ResultOrError<MemoryMatchRound> {
        if (!this.has(cardSquenceNumber)) {
            return new FailedToUpdateMissingMemoryMatchCardError(this.id, cardSquenceNumber);
        }

        const targetCard = this.get(cardSquenceNumber) as MemoryMatchCard;

        if (targetCard.hasAudio()) {
            return new CannotOverwriteAudioForMemoryMatchCardError(
                this.id,
                cardSquenceNumber,
                targetCard.audioId,
                mediaItemId
            );
        }

        targetCard.audioId = mediaItemId;

        return this;
    }

    addImageForCard(
        sequenceNumber: number,
        mediaItemIdForImage: AggregateId
    ): ResultOrError<MemoryMatchRound> {
        if (!this.has(sequenceNumber)) {
            return new FailedToUpdateMissingMemoryMatchCardError(this.id, sequenceNumber);
        }

        const targetCard = this.get(sequenceNumber) as MemoryMatchCard;

        if (targetCard.hasImage()) {
            return new CannotOverwriteImageForMemoryMatchCardError(
                this.id,
                sequenceNumber,
                targetCard.imageId,
                mediaItemIdForImage
            );
        }

        targetCard.addImage(mediaItemIdForImage);

        return this;
    }

    addTextForCard(cardSequenceNumber: number, text: string, languageCode: LanguageCode) {
        if (!this.has(cardSequenceNumber)) {
            return new FailedToUpdateMissingMemoryMatchCardError(this.id, cardSequenceNumber);
        }

        const targetCard = this.get(cardSequenceNumber) as MemoryMatchCard;

        if (!isNullOrUndefined(targetCard.text)) {
            return new CannotOverwriteTextForMemoryMatchCardError(
                this.id,
                cardSequenceNumber,
                targetCard.text,
                text,
                languageCode
            );
        }

        targetCard.addText(text, languageCode);

        return this;
    }

    publish(): ResultOrError<MemoryMatchRound> {
        if (this.isPublished) {
            return new FailedToRepublishMemoryMatchRoundError(this.id);
        }

        this.isPublished = true;

        return this;
    }

    unpublish(): ResultOrError<MemoryMatchRound> {
        if (!this.isPublished) {
            return new FailedToUnpublishDraftMemoryMatchRoundError(this.id);
        }

        this.isPublished = false;

        return this;
    }

    get(sequenceNumber: Number): Maybe<MemoryMatchCard> {
        if (!this.has(sequenceNumber)) {
            return NotFound;
        }

        return this.cards.find((card) => card.sequenceNumber === sequenceNumber);
    }

    has(sequenceNumber: Number): boolean {
        return this.cards.some((card) => card.sequenceNumber === sequenceNumber);
    }

    hasCardback(): boolean {
        return !isNullOrUndefined(this.cardBackImageId);
    }
}
