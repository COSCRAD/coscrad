import { Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { Song } from '../../models/song/song.entity';
import { Tag } from '../../models/tag/tag.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class SongQueryService extends BaseQueryService<Song, SongViewModel> {
    constructor(repositoryProvider: RepositoryProvider, commandInfoService: CommandInfoService) {
        super(ResourceType.song, repositoryProvider, commandInfoService);
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
}
