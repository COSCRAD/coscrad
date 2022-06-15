import { Injectable } from '@nestjs/common';
import mixTagsIntoViewModel from '../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { Tag } from '../../models/tag/tag.entity';
import { ISpecification } from '../../repositories/interfaces/ISpecification';
import IsPublished from '../../repositories/specifications/isPublished';
import { isAggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { GeneralQueryOptions } from './types/GeneralQueryOptions';
import getDefaultQueryOptions from './utilities/getDefaultQueryOptions';

const defaultOptions = getDefaultQueryOptions();

@Injectable()
export class MediaItemQueryService {
    constructor(private readonly repositoryProvider: RepositoryProvider) {}

    async fetchById(
        id: unknown,
        options: Partial<GeneralQueryOptions> = {}
    ): Promise<InternalError | Maybe<MediaItemViewModel>> {
        if (!isAggregateId(id)) return new InternalError(`Invalid media item ID: ${id}`);

        const { shouldReturnUnpublishedEntities } = {
            ...defaultOptions,
            ...options,
        };

        const searchResult = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchById(id);

        if (isInternalError(searchResult)) {
            // One of the DTOs failed invariant validation
            throw searchResult;
        }

        if (isNotFound(searchResult)) return NotFound;

        if (!shouldReturnUnpublishedEntities && !searchResult.published) return NotFound;

        const viewModel = new MediaItemViewModel(searchResult);

        const viewModelWithTags = await this.mixinTheTags(viewModel);

        return cloneToPlainObject(viewModelWithTags);
    }

    async fetchMany(
        // TODO Should there be a translation layer from view model to model specification?
        specification: ISpecification<MediaItem> = new IsPublished(true)
    ): Promise<MediaItemViewModel[]> {
        const searchResult = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany(specification);

        const validModels = searchResult.filter(
            (model): model is MediaItem => !isInternalError(model)
        );

        const viewModels = validModels.map((model) => new MediaItemViewModel(model));

        const viewModelsWithTags = await this.mixinTheTags(viewModels);

        return viewModelsWithTags.map(cloneToPlainObject);
    }

    /**
     * TODO [DRY] Find a way to share this with all view model query services
     *
     * TODO [Performance] Find a way to parallelize the query for models & tags
     */
    private async mixinTheTags(viewModel: MediaItemViewModel): Promise<MediaItemViewModel>;
    private async mixinTheTags(viewModels: MediaItemViewModel[]): Promise<MediaItemViewModel[]>;
    private async mixinTheTags(
        viewModelOrViewModels: MediaItemViewModel | MediaItemViewModel[]
    ): Promise<MediaItemViewModel | MediaItemViewModel[]> {
        const result = await this.repositoryProvider.getTagRepository().fetchMany();

        const invalidTagErrors = result.filter(isInternalError);

        if (invalidTagErrors.length > 0) {
            throw new InternalError(
                `One or more invalid tags encountered. See inner errors.`,
                invalidTagErrors
            );
        }

        const allTags = result as Tag[];

        const mixinTags = (viewModel: MediaItemViewModel) =>
            mixTagsIntoViewModel<MediaItemViewModel>(viewModel, allTags, ResourceType.mediaItem);

        return Array.isArray(viewModelOrViewModels)
            ? viewModelOrViewModels.map(mixinTags)
            : mixinTags(viewModelOrViewModels);
    }
}
