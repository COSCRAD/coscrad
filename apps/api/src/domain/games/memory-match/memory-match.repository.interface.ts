import { Maybe } from '../../../lib/types/maybe';
import { AggregateId } from '../../types/AggregateId';
import { MemoryMatchRound } from './models/memory-match-round.entity';

export interface IMemoryMatchRepository {
    create(round: MemoryMatchRound): Promise<void>;

    createMany(rounds: MemoryMatchRound[]): Promise<void>;

    delete(roundId: AggregateId): Promise<void>;

    fetchById(roundId: AggregateId): Promise<Maybe<MemoryMatchRound>>;

    fetchMany(): Promise<MemoryMatchRound[]>;

    count(): Promise<number>;
}
