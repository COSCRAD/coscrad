import { UUID, NestedDataType, NonNegativeFiniteNumber, BooleanDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { DTO } from 'apps/api/src/types/DTO';
import { isBoolean } from 'node:util';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { MemoryMatchCard } from './memory-match-card.entity';
import { MemoryMatchRound } from './memory-match-round.entity';

interface UrlBuilder{
    build:(mediaItemId: string)
}

const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

class MemoryMatchRoundViewModel {
    
    @UUID({
            label: 'round ID',
            description: 'A unique system identifier for this memory match round',
        })
        id: AggregateId;
    
        @UUID({
            label: 'the back image for a card',
            description: 'A image for the back of a card',
            isOptional: true,
        })
        cardBackImageId?: AggregateId;
    
        @NestedDataType(MemoryMatchCard, {
            label: 'cards identifier',
            description: 'Identifier for the cards',
            isArray: true,
            isOptional: true, 
        })
        cards: MemoryMatchCard[];
    
        @NestedDataType(MultilingualText, {
            label: 'name',
            description: 'A name for the card',
        })
        name: MultilingualText;
    
        @NestedDataType(MultilingualText, {
            label: 'description',
            description: 'The descripton',
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
                'A reference to the contributors who provided audio, photographs, or text for this round',
            isArray: true,
            isOptional: true,
        })
        contributors: AggregateId[];
    
        @NonNegativeFiniteNumber({
            label: 'size',
            description: 'The size',
        })
        size: number = NUMBER_OF_PAIRS_IN_A_ROUND;
    
        @BooleanDataType({
            label: 'is published',
            description: 'Is this memory match round published?',
        })
        isPublished: boolean;
    
        constructor(round: MemoryMatchRound, private readonly urlBuilder: UrlBuilder) {
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
    
            this.cardBackImageId = cardBackImageId;
    
            if (Array.isArray(cards)) {
                this.cards = cards.map((c) => new MemoryMatchCard(c));
            }
    
            if (Array.isArray(contributors)) {
                // shallow clone
                this.contributors = contributors.map((c) => c);
            }
    
            if (Array.isArray(compiledBy)) {
                // shallow clone
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