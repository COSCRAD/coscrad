import { CoscradUserRole } from '@coscrad/data-types';
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
import formatResourceType from '../../../view-models/presentation/formatAggregateType';
import { Resource } from '../../models/resource.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { Tag } from '../../models/tag/tag.entity';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateId, isAggregateId } from '../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';

export type AggregateByIdQueryResult<UViewModel extends BaseViewModel> = {
    data: UViewModel;
    actions: CommandInfo[];
};

export type AggregateIndexQueryResult<UViewModel extends BaseViewModel> = {
    data: AggregateByIdQueryResult<UViewModel>[];
    actions: CommandInfo[];
};

type ViewModelWithTags<T> = T & { tags: TagViewModel[] };

type ResourceFilter = (resource: Resource) => boolean;

const buildAccessFilter = (userWithGroups?: CoscradUserWithGroups): ResourceFilter => {
    if (isNullOrUndefined(userWithGroups)) return (resource: Resource) => resource.published;

    if (!(userWithGroups instanceof CoscradUserWithGroups)) {
        throw new InternalError(`Invalid user with groups encountered: ${userWithGroups}`);
    }

    const { roles } = userWithGroups;

    if (!roles) {
        throw new InternalError(`Invalid user with groups encountered: ${userWithGroups.toDTO()}`);
    }

    return userWithGroups.roles.includes(CoscradUserRole.projectAdmin) ||
        userWithGroups.roles.includes(CoscradUserRole.superAdmin)
        ? (_: Resource) => true
        : (resource: Resource) =>
              resource.published ||
              resource.queryAccessControlList.canUser(userWithGroups.id) ||
              userWithGroups.groups.some(({ id: groupId }) =>
                  resource.queryAccessControlList.canGroup(groupId)
              );
};

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
            tag: tags,
        });
    }

    protected fetchDomainModelById(id: AggregateId): Promise<ResultOrError<Maybe<TDomainModel>>> {
        return this.repositoryProvider.forResource<TDomainModel>(this.type).fetchById(id);
    }

    protected fetchManyDomainModels(
        specification?: ISpecification<TDomainModel>
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
        userWithGroups?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<AggregateByIdQueryResult<ViewModelWithTags<UViewModel>>>>> {
        if (!isAggregateId(id))
            return new InternalError(
                `Invalid id: ${id} for resource of type: ${formatResourceType(this.type)}`
            );

        const externalState = await this.fetchRequiredExternalState();

        const domainModelSearchResult = await this.fetchDomainModelById(id);

        if (isInternalError(domainModelSearchResult)) {
            // Database document does not satisfy invariants
            throw domainModelSearchResult;
        }

        if (isNotFound(domainModelSearchResult)) return NotFound;

        const isResourceAvailableToUser = buildAccessFilter(userWithGroups);

        if (!isResourceAvailableToUser(domainModelSearchResult)) return NotFound;

        const viewModel = this.buildViewModel(domainModelSearchResult, externalState);

        const viewModelWithTags = mixTagsIntoViewModel(
            viewModel,
            externalState.tag,
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
        userWithGroups?: CoscradUserWithGroups
    ): Promise<AggregateIndexQueryResult<ViewModelWithTags<UViewModel>>> {
        const searchResult = await this.fetchManyDomainModels();

        const requiredExternalState = await this.fetchRequiredExternalState();

        const accessFilter = buildAccessFilter(userWithGroups);

        const validInstances = searchResult.filter(validAggregateOrThrow).filter(accessFilter);

        const data = validInstances.map((instance) => ({
            data: mixTagsIntoViewModel(
                this.buildViewModel(instance, requiredExternalState),
                requiredExternalState.tag,
                this.type
            ),
            actions: this.commandInfoService.getCommandInfo(instance),
        }));

        return {
            data,
            actions: this.getInfoForIndexScopedCommands(),
        } as unknown as AggregateIndexQueryResult<ViewModelWithTags<UViewModel>>;
    }
}
