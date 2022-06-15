import {
    CommandInfo,
    CommandInfoService,
    CommandWriteContext,
} from '../../../app/controllers/command/services/command-info-service';
import mixTagsIntoViewModel from '../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { ResultOrError } from '../../../types/ResultOrError';
import { TagViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../../view-models/buildViewModelForResource/viewModels/base.view-model';
import { Resource } from '../../models/resource.entity';
import { Song } from '../../models/song/song.entity';
import { ISpecification } from '../../repositories/interfaces/ISpecification';
import { AggregateId, isAggregateId } from '../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
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
    constructor(
        private readonly type: ResourceType,
        protected readonly commandInfoService: CommandInfoService
    ) {}

    abstract fetchRequiredExternalState(): Promise<InMemorySnapshot>;

    abstract fetchDomainModelById(id: AggregateId): Promise<ResultOrError<Maybe<TDomainModel>>>;

    abstract fetchManyDomainModels(
        specification: ISpecification<TDomainModel>
    ): Promise<ResultOrError<TDomainModel>[]>;

    abstract buildViewModel(
        domainInstance: TDomainModel,
        externalState: InMemorySnapshot
    ): UViewModel;

    public async fetchById(
        id: unknown,
        userOptions: Partial<GeneralQueryOptions> = {}
    ): Promise<ResultOrError<Maybe<ResourceByIdQueryResult<ViewModelWithTags<UViewModel>>>>> {
        if (!isAggregateId(id)) return new InternalError(`Invalid id: ${id} for a ${this.type}`);

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
            actions: this.commandInfoService.getCommandInfo(
                // TODO Implement CommandWriteContext on all Resource sub-classes
                domainModelSearchResult as unknown as CommandWriteContext
            ),
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
            actions: this.commandInfoService.getCommandInfo(
                // TODO Implement CommandWriteContext on all Resource sub-classes
                instance as unknown as CommandWriteContext
            ),
        }));

        return {
            data,
            // TODO Get the Ctor here dynamically!
            actions: this.commandInfoService.getCommandInfo(Song) || [],
        } as unknown as ResourceIndexQueryResult<ViewModelWithTags<UViewModel>>;
    }
}
