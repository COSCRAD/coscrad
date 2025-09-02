import { IMemoryMatchRound } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { AggregateId } from '../../../types/AggregateId';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

export class MemoryMatchService {
    constructor(
        @Inject(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN)
        private readonly memoryMatchRepository: IMemoryMatchRepository,
        private readonly configService: ConfigService
    ) {}

    async fetchById(roundId: AggregateId): Promise<IMemoryMatchRound> {
        // we need to call this.memorymatchRepository.fetchById(roundId)
        const searchResult = await this.memoryMatchRepository.fetchById(roundId);
        // handle not found or use intercepter

        // be sure to return not found if the round is unpublished

        // finally return a published round

        const round = searchResult as MemoryMatchRound;

        const view = cloneToPlainObject(round) as unknown as IMemoryMatchRound;

        // convert media item IDs to Urls

        view.cardbackImageUrl = `${this.configService.get('BASE_URL')}:${this.configService.get(
            'NODE_PORT'
        )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/download/${
            round.cardBackImageId
        }`;

        // TODO build all media item urls
        return view;
    }

    async fetchMany(): Promise<{ entities: IMemoryMatchRound[] }> {
        // we need to call this.memoryMatchRepo.fetchMany()

        // filter out unpublished rounds

        // return an object with these rounds as the entities property

        throw new Error('not implemented');
    }
}
