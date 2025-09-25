import {
    BooleanDataType,
    NestedDataType,
    NonNegativeFiniteNumber,
    UUID,
} from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject, isNonEmptyString } from '@coscrad/validation-constraints';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { MemoryMatchCardViewModel } from './memory-match-card.view-model';
import { MemoryMatchRound } from './memory-match-round.entity';

interface UrlBuilder {
    build(mediaItemId: string): string;
}

const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

export class MemoryMatchRoundViewModel {
    @UUID({
        label: 'round ID',
        description: 'A unique system identifier for this memory match round',
    })
    id: AggregateId;

    @UUID({
        label: 'the back image for a card',
        description: `A link to the image for the backs of this round's cards`,
        isOptional: true,
    })
    cardBackImageUrl?: AggregateId;

    @NestedDataType(MemoryMatchCardViewModel, {
        label: 'cards',
        description: 'List of cards in this round',
        isArray: true,
        isOptional: true,
    })
    cards: MemoryMatchCardViewModel[];

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'Name of this memory match round',
    })
    name: MultilingualText;

    @NestedDataType(MultilingualText, {
        label: 'description',
        description: 'A descripton of this round',
    })
    description: MultilingualText;

    @UUID({
        label: 'compiled by',
        description: 'Reference to the contributors who compiled this memory match round',
        isArray: true,
        isOptional: true,
    })
    compiledBy: AggregateId[];

    @UUID({
        label: 'contributors',
        description:
            'A list of references to the contributors who provided audio, photographs, or text for this round',
        isArray: true,
        isOptional: true,
    })
    contributors: AggregateId[];

    @NonNegativeFiniteNumber({
        label: 'size',
        description: 'The number of cards in this round',
    })
    size: number = NUMBER_OF_PAIRS_IN_A_ROUND;

    @BooleanDataType({
        label: 'is published',
        description: 'Is this memory match round published?',
    })
    isPublished: boolean;

    constructor(round: MemoryMatchRound, urlBuilder: UrlBuilder) {
        if (!round) return;

        const {
            id,
            cards,
            isPublished,
            cardBackImageId,
            contributors,
            compiledBy,
            name,
            description,
        } = round;

        this.id = id;

        if (isBoolean(isPublished)) {
            this.isPublished = isPublished;
        }

        if (isNonEmptyString(cardBackImageId)) {
            this.cardBackImageUrl = urlBuilder.build(cardBackImageId);
        }

        if (Array.isArray(cards)) {
            this.cards = cards.map((c) => new MemoryMatchCardViewModel(c, urlBuilder));
        }

        if (Array.isArray(contributors)) {
            this.contributors = contributors.map((c) => c);
        }

        if (Array.isArray(compiledBy)) {
            this.compiledBy = compiledBy.map((c) => c);
        }

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name as DTO<MultilingualText>);
        }

        if (isNonEmptyObject(description)) {
            this.description = new MultilingualText(description as DTO<MultilingualText>);
        }
    }
}
