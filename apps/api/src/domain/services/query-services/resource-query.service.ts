import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IIndexQueryResult,
    WithTags,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import mixTagsIntoViewModel from '../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { TagViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../../queries/buildViewModelForResource/viewModels/base.view-model';
import formatResourceType from '../../../queries/presentation/formatAggregateType';
import { ResultOrError } from '../../../types/ResultOrError';
import { Resource } from '../../models/resource.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { Tag } from '../../models/tag/tag.entity';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateId, isAggregateId } from '../../types/AggregateId';
import { AggregateTypeToAggregateInstance } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { buildAccessFilter } from './utilities/buildAccessFilter';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

type ViewModelWithTags<T> = WithTags<T>;

export abstract class ResourceQueryService<
    TDomainModel extends Resource,
    UViewModel extends BaseViewModel
> {
    protected abstract readonly type: ResourceType;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    /**
     * All Resource Query Services will need to mixin the `Tags`. Some view models
     * require additional external state (e.g. a Vocabulary List requires all Terms)
     * to do joins. Override this method in the child class if you need more than
     * just the tags to build your view model.
     */
    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const tagSearchResult = await this.repositoryProvider.getTagRepository().fetchMany();

        const tags = tagSearchResult.filter((result): result is Tag => !isInternalError(result));

        return new DeluxeInMemoryStore({
            tag: tags,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected async fetchDomainModelById(
        id: AggregateId
    ): Promise<ResultOrError<Maybe<TDomainModel>>> {
        const repository = this.repositoryProvider.forResource<TDomainModel>(this.type);

        const resource = await repository.fetchById(id);

        return resource;
    }

    protected fetchManyDomainModels(
        specification?: ISpecification<TDomainModel>
    ): Promise<ResultOrError<TDomainModel>[]> {
        return this.repositoryProvider
            .forResource<TDomainModel>(this.type)
            .fetchMany(specification);
    }

    // TODO Rename this!
    protected foo: AggregateTypeToAggregateInstance;

    abstract buildViewModel(
        domainInstance: TDomainModel,
        externalState: InMemorySnapshot
    ): UViewModel;

    /**
     * Union models have multiple ctors which must all be considered when
     * collecting index-scoped actions.
     */
    abstract getDomainModelCtors(): DomainModelCtor[];

    public async fetchById(
        id: unknown,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<ViewModelWithTags<UViewModel>>>>> {
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
            ...viewModelWithTags,
            actions: this.fetchUserActions(userWithGroups, [domainModelSearchResult]),
        };
    }

    public async fetchByName(
        _name: string,
        _userWithGroups?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<UViewModel>>> {
        throw new InternalError('Not Implemented');

        // const allResources = await this.fetchMany();

        // now find in `allResources` the resource with the given `name` by filtering

        // if there are 2, throw an error

        // if there are 0 return not found

        // if there is 1
        //      if it is an error, return it (the error)
        //      otherwise, build a view model for this resource
    }

    public async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<ViewModelWithTags<UViewModel>>> {
        const searchResult = await this.fetchManyDomainModels();

        const requiredExternalState = await this.fetchRequiredExternalState();

        const accessFilter = buildAccessFilter(userWithGroups);

        const validInstances = searchResult.filter(validAggregateOrThrow).filter(accessFilter);

        const entities = validInstances.map((instance) => ({
            ...mixTagsIntoViewModel<UViewModel>(
                this.buildViewModel(instance, requiredExternalState),
                requiredExternalState.tag,
                this.type
            ),
            actions: this.fetchUserActions(userWithGroups, [instance]),
        }));

        return {
            entities,
            indexScopedActions: this.fetchUserActions(userWithGroups, this.getDomainModelCtors()),
        };
    }

    public async validate(userWithGroups?: CoscradUserWithGroups): Promise<Maybe<string[]>> {
        if (!userWithGroups || !userWithGroups.isAdmin()) return NotFound;

        const searchResult = await this.fetchManyDomainModels();

        const invariantValidationErrors = searchResult.filter(isInternalError);

        return invariantValidationErrors.map((error) => error.toString());
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184098960]
     *
     * Inherit from a shared base aggregate query service and share this logic with other
     * query services.
     */
    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContexts: CommandContext[]
    ): ICommandFormAndLabels[] {
        return commandContexts.flatMap((commandContext) =>
            fetchActionsForUser(this.commandInfoService, systemUser, commandContext)
        );
    }
}
