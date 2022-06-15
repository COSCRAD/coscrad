import { Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import mixTagsIntoViewModel from '../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { Song } from '../../models/song/song.entity';
import { Tag } from '../../models/tag/tag.entity';
import { isAggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { GeneralQueryOptions } from './types/GeneralQueryOptions';
import getDefaultQueryOptions from './utilities/getDefaultQueryOptions';

@Injectable()
export class SongQueryService {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        private readonly commandInfoService: CommandInfoService
    ) {}

    async fetchById(
        id: unknown,
        userOptions: Partial<GeneralQueryOptions> = {}
    ): Promise<ResultOrError<Maybe<SongViewModel>>> {
        if (!isAggregateId(id)) return new InternalError(`Invalid song ID: ${id}`);

        const { shouldReturnUnpublishedEntities } = {
            ...getDefaultQueryOptions(),
            ...userOptions,
        };

        const searchResult = await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchById(id);

        const tagSearchResult = await this.repositoryProvider.getTagRepository().fetchMany();

        const tagErrors = tagSearchResult.filter(isInternalError);

        if (tagErrors.length > 0) {
            throw new InternalError(
                `One or more invalid tags encountered. See inner errors`,
                tagErrors
            );
        }

        const allTags = tagSearchResult as Tag[];

        if (isInternalError(searchResult)) {
            // One of the DTOs failed invariant validation
            throw searchResult;
        }

        if (isNotFound(searchResult)) return NotFound;

        if (!shouldReturnUnpublishedEntities && !searchResult.published) return NotFound;

        // TODO Do this on the base view model
        const actions = this.commandInfoService.getCommandInfo(searchResult);

        const viewModel = new SongViewModel(searchResult);

        const viewModelWithTags = mixTagsIntoViewModel<Song>(viewModel, allTags, ResourceType.song);

        return cloneToPlainObject({
            data: viewModelWithTags,
            actions,
        });
    }

    async fetchMany(): Promise<SongViewModel[]> {
        const actions = await this.commandInfoService.getCommandInfo(Song);

        const allSongs = await (
            await this.repositoryProvider.forResource<Song>(ResourceType.song).fetchMany()
        ).filter((result): result is Song => !isInternalError(result));

        const allViewModels = allSongs.map((song) => new SongViewModel(song));

        return cloneToPlainObject({
            data: allViewModels,
            actions,
        });
    }
}
