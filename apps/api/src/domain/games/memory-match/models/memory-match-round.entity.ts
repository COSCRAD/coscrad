import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
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

    addAudioForCard(cardSquenceNumber: number, mediaItemId: AggregateId) {}

    hasAudio() {
        return;
    }

    hasCard() {
        return;
    }

    getCard() {
        return;
    }

    addAudio() {
        return;
    }
}
