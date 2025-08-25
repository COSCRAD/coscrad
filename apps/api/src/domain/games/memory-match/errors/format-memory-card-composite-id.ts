import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export const formatMemoryMatchCardCompositeIdentifier = (
    roundId: AggregateId,
    cardSequenceNumber: number
): string => `${buildMemoryRoundCompositeId(roundId)} (card: ${cardSequenceNumber})`;
