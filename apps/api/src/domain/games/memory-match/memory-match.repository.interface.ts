import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { MemoryMatchRound } from './models/memory-match-round.entity';

export const MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN = 'MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN';

export interface IMemoryMatchRepository {
    fetchById(
        roundId: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<MemoryMatchRound>>;

    fetchMany(userWithGroups?: CoscradUserWithGroups): Promise<MemoryMatchRound[]>;

    count(): Promise<number>;

    create(round: MemoryMatchRound): Promise<InternalError | AggregateId>;

    createMany(rounds: MemoryMatchRound[]): Promise<void>;

    delete(roundId: AggregateId): Promise<void>;

    publish(roundId: AggregateId): Promise<Error | AggregateId>;

    unpublish(roundId: AggregateId): Promise<Error | AggregateId>;
}
