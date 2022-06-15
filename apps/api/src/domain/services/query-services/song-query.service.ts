import { Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { Song } from '../../models/song/song.entity';
import { Tag } from '../../models/tag/tag.entity';
import { ISpecification } from '../../repositories/interfaces/ISpecification';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class SongQueryService extends BaseQueryService<Song, SongViewModel> {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        // we may need to inject this manually
        commandInfoService: CommandInfoService
    ) {
        super(ResourceType.song, commandInfoService);
    }

    async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const tags = (await this.repositoryProvider.getTagRepository().fetchMany()).filter(
            (result): result is Tag => !isInternalError(result)
        );

        return buildInMemorySnapshot({
            tags,
        });
    }

    buildViewModel(song: Song, _: InMemorySnapshot) {
        return new SongViewModel(song);
    }

    async fetchDomainModelById(id: string): Promise<ResultOrError<Maybe<Song>>> {
        return this.repositoryProvider.forResource<Song>(ResourceType.song).fetchById(id);
    }

    async fetchManyDomainModels(
        specification: ISpecification<Song>
    ): Promise<ResultOrError<Song>[]> {
        return this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchMany(specification);
    }
}
