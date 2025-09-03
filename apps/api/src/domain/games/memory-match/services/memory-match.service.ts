import { IMemoryMatchRound } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
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

    async fetchById(roundId: AggregateId): Promise<Maybe<IMemoryMatchRound>> {
        // we need to call this.memorymatchRepository.fetchById(roundId)
        const searchResult = await this.memoryMatchRepository.fetchById(roundId);

        // handle not found or use intercepter
        if (isNotFound(searchResult)) {
            return NotFound;
        }

        // be sure to return not found if the round is unpublished

        if (!searchResult.isPublished) {
            return NotFound;
        }

        // finally return a published round
        return this.buildView(searchResult);
    }

    async fetchMany(): Promise<{ entities: IMemoryMatchRound[] }> {
        const searchResult = await this.memoryMatchRepository.fetchMany();

        // filter out unpublished rounds

        // return an object with these rounds as the entities property

        return {
            // we use `flatMap` to achievev map + filter
            entities: searchResult.flatMap((domainModel) =>
                domainModel.isPublished ? [this.buildView(domainModel)] : []
            ),
        };
    }

    // TODO should we rename `IMemoryMatchRound` to `IMemoryMatchRoundViewModel` for consistency in naming?
    private buildView(memoryMatchRound: MemoryMatchRound): IMemoryMatchRound {
        const view = cloneToPlainObject(memoryMatchRound) as unknown as IMemoryMatchRound;

        // convert media item IDs to Urls

        view.cardbackImageUrl = `${this.configService.get('BASE_URL')}:${this.configService.get(
            'NODE_PORT'
        )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/download/${
            memoryMatchRound.cardBackImageId
        }`;

        // TODO build all media item urls
        return view;
    }
}
