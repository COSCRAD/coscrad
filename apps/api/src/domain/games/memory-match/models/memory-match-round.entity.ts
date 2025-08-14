import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import {
    CannotOverwriteImageForMemoryMatchCardError,
    FailedToUpdateMissingMemoryMatchCardError,
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

    addAudioForCard(_cardSquenceNumber: number, _mediaItemId: AggregateId) {
        throw new Error(`not implemented`);
    }

    addCard(): ResultOrError<number> {
        const nextSequenceNumber = this.cards.length + 1;

        // TODO check size
        this.cards.push(
            new MemoryMatchCard({
                sequenceNumber: nextSequenceNumber,
            })
        );

        return nextSequenceNumber;
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

    get(sequenceNumber: Number): Maybe<MemoryMatchCard> {
        if (!this.has(sequenceNumber)) {
            return NotFound;
        }

        return this.cards.find((card) => card.sequenceNumber === sequenceNumber);
    }

    has(sequenceNumber: Number): boolean {
        return this.cards.some((card) => card.sequenceNumber === sequenceNumber);
    }
}
