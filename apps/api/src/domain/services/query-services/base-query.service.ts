import { Inject } from '@nestjs/common';
import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import mixTagsIntoViewModel from '../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { TagViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../../view-models/buildViewModelForResource/viewModels/base.view-model';
import formatResourceType from '../../../view-models/presentation/formatResourceType';
import { Resource } from '../../models/resource.entity';
import { Tag } from '../../models/tag/tag.entity';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateId, isAggregateId } from '../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { GeneralQueryOptions } from './types/GeneralQueryOptions';
import getDefaultQueryOptions from './utilities/getDefaultQueryOptions';

type ResourceByIdQueryResult<UViewModel extends BaseViewModel> = {
    data: UViewModel;
    actions: CommandInfo[];
};

type ResourceIndexQueryResult<UViewModel extends BaseViewModel> = {
    data: ResourceByIdQueryResult<UViewModel>[];
    actions: CommandInfo[];
};

type ViewModelWithTags<T> = T & { tags: TagViewModel[] };

export abstract class BaseQueryService<
    TDomainModel extends Resource,
    UViewModel extends BaseViewModel
> {
    protected abstract readonly type: ResourceType;

    constructor(
        @Inject(RepositoryProvider) protected readonly repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    /**
     * All Resource Query Services will need to mixin the `Tags`. Some view models
     * require additional external state (e.g. a Vocabulary List requires all Terms)
     * to do joins. Override this method in the child class if you need more than
     * just the tags to build your view model.
     */
    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const tags = (await this.repositoryProvider.getTagRepository().fetchMany()).filter(
            (result): result is Tag => !isInternalError(result)
        );

        return buildInMemorySnapshot({
            tags,
        });
    }

    protected fetchDomainModelById(id: AggregateId): Promise<ResultOrError<Maybe<TDomainModel>>> {
        return this.repositoryProvider.forResource<TDomainModel>(this.type).fetchById(id);
    }

    protected fetchManyDomainModels(
        specification: ISpecification<TDomainModel>
    ): Promise<ResultOrError<TDomainModel>[]> {
        return this.repositoryProvider
            .forResource<TDomainModel>(this.type)
            .fetchMany(specification);
    }

    abstract buildViewModel(
        domainInstance: TDomainModel,
        externalState: InMemorySnapshot
    ): UViewModel;

    abstract getInfoForIndexScopedCommands(): CommandInfo[];

    public async fetchById(
        id: unknown,
        userOptions: Partial<GeneralQueryOptions> = {}
    ): Promise<ResultOrError<Maybe<ResourceByIdQueryResult<ViewModelWithTags<UViewModel>>>>> {
        if (!isAggregateId(id))
            return new InternalError(
                `Invalid id: ${id} for resource of type: ${formatResourceType(this.type)}`
            );

        const { shouldReturnUnpublishedEntities } = {
            ...getDefaultQueryOptions(),
            ...userOptions,
        };

        const externalState = await this.fetchRequiredExternalState();

        const domainModelSearchResult = await this.fetchDomainModelById(id);

        if (isInternalError(domainModelSearchResult)) {
            // Database document does not satisfy invariants
            throw domainModelSearchResult;
        }

        if (isNotFound(domainModelSearchResult)) return NotFound;

        if (!shouldReturnUnpublishedEntities && !domainModelSearchResult.published) return NotFound;

        const viewModel = this.buildViewModel(domainModelSearchResult, externalState);

        const viewModelWithTags = mixTagsIntoViewModel(
            viewModel,
            externalState.tags,
            this.type
        ) as UViewModel & {
            tags: TagViewModel[];
        };

        return {
            data: viewModelWithTags,
            actions: this.commandInfoService.getCommandInfo(domainModelSearchResult),
        };
    }

    public async fetchMany(
        specification: ISpecification<TDomainModel>
    ): Promise<ResourceIndexQueryResult<ViewModelWithTags<UViewModel>>> {
        const searchResult = await this.fetchManyDomainModels(specification);

        const requiredExternalState = await this.fetchRequiredExternalState();

        const validInstances = searchResult.filter(
            (result): result is TDomainModel => !isInternalError(result)
        );

        const data = validInstances.map((instance) => ({
            data: mixTagsIntoViewModel(
                this.buildViewModel(instance, requiredExternalState),
                requiredExternalState.tags,
                this.type
            ),
            actions: this.commandInfoService.getCommandInfo(instance),
        }));

        return {
            data,
            actions: this.getInfoForIndexScopedCommands(),
        } as unknown as ResourceIndexQueryResult<ViewModelWithTags<UViewModel>>;
    }
}
