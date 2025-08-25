import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { MEMORY_MATCH_ROUND } from '../constants';

export const buildMemoryRoundCompositeId = (roundId: AggregateId) => ({
    type: MEMORY_MATCH_ROUND,
    id: roundId,
});

export const formatMemoryRoundCompositeId = (roundId: string): string =>
    formatAggregateCompositeIdentifier(buildMemoryRoundCompositeId(roundId));
