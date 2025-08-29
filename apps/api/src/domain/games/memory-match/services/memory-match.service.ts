import { IMemoryMatchRound } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { AggregateId } from '../../../types/AggregateId';
import { MEMORY_MATCH_ROUND } from '../constants';
import { IMemoryMatchRepository } from '../memory-match.repository.interface';

export class MemoryMatchService {
    constructor(
        @Inject(MEMORY_MATCH_ROUND)
        private readonly memoryMatchRepository: IMemoryMatchRepository
    ) {}

    async fetchById(_roundId: AggregateId): Promise<IMemoryMatchRound> {
        // we need to call this.memorymatchRepository.fetchById(roundId)

        // handle not found or use intercepter

        // be sure to return not found if the round is unpublished
        throw new Error('not implemented');
    }

    async fetchMany(): Promise<{ entities: IMemoryMatchRound[] }> {
        // we need to call this.memoryMatchRepo.fetchMany()

        // filter out unpublished rounds

        // return an object with these rounds as the entities property

        throw new Error('not implemented');
    }
}
