import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IIndexQueryResult,
    IMediaItemViewModel,
    MIMEType,
    WithTags,
} from '@coscrad/api-interfaces';
import {
    isNonEmptyObject,
    isNonEmptyString,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import {
    CommandContext,
    CommandInfoService,
} from '../../../../app/controllers/command/services/command-info-service';
import mixTagsIntoViewModel from '../../../../app/controllers/utilities/mixTagsIntoViewModel';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import { ArangoDocumentForAggregateRoot } from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { ResultOrError } from '../../../../types/ResultOrError';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { ISpecification } from '../../../repositories/interfaces/specification.interface';
import { buildAccessFilter } from '../../../services/query-services/utilities/buildAccessFilter';
import { fetchActionsForUser } from '../../../services/query-services/utilities/fetch-actions-for-user';
import { AggregateId, isAggregateId } from '../../../types/AggregateId';
import { AggregateTypeToAggregateInstance } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import BaseDomainModel from '../../base-domain-model.entity';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { validAggregateOrThrow } from '../../shared/functional';
import { Tag } from '../../tag/tag.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { MediaItem } from '../entities/media-item.entity';
import { MediaItemViewModel } from './media-item.view-model';

// TODO remove this- this is temporary to support a refactor
interface FilepathResponse {
    root: string;
    filepath: string;
    mimeType: MIMEType;
    filename: string;
}

@Injectable()
export class MediaItemQueryService {
    private readonly type = ResourceType.mediaItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        protected readonly databaseProvider: ArangoDatabaseProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
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
    ): Promise<ResultOrError<Maybe<MediaItem>>> {
        const repository = this.repositoryProvider.forResource<MediaItem>(this.type);

        const resource = await repository.fetchById(id);

        return resource;
    }

    protected fetchManyDomainModels(
        specification?: ISpecification<MediaItem>
    ): Promise<ResultOrError<MediaItem>[]> {
        return this.repositoryProvider.forResource<MediaItem>(this.type).fetchMany(specification);
    }

    // TODO Rename this!
    protected foo: AggregateTypeToAggregateInstance;

    public async fetchById(
        id: unknown,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<WithTags<IMediaItemViewModel>>>>> {
        if (!isAggregateId(id))
            return new InternalError(`Invalid id: ${id} for resource of type: ${this.type}`);

        const externalState = await this.fetchRequiredExternalState();

        const domainModelSearchResult = await this.fetchDomainModelById(id);

        if (isInternalError(domainModelSearchResult)) {
            // Database document does not satisfy invariants
            throw domainModelSearchResult;
        }

        if (isNotFound(domainModelSearchResult)) return NotFound;

        const isResourceAvailableToUser = buildAccessFilter(userWithGroups);

        if (!isResourceAvailableToUser(domainModelSearchResult)) return NotFound;

        const viewModel = this.buildViewModel(domainModelSearchResult);

        const viewModelWithTags = mixTagsIntoViewModel(
            viewModel,
            externalState.tag,
            this.type
        ) as IMediaItemViewModel & {
            tags: TagViewModel[];
        };

        return {
            ...viewModelWithTags,
            actions: this.fetchUserActions(userWithGroups, [domainModelSearchResult]),
        };
    }

    public async fetchByName(
        name: string,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<IMediaItemViewModel>>>> {
        const query = `
        for m in @@collectionName
        filter m.title == @name
        return m
        `;

        const bindVars = {
            '@collectionName': ArangoCollectionId.media_items,
            name,
        };

        // TODO filter by name in database
        const cursor = await this.databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.media_items)
            .query({
                query,
                bindVars,
            });

        const result = await cursor.all();

        if (result.length == 0) {
            return NotFound;
        }

        if (result.length > 1) {
            // TODO custom error class
            throw new InternalError(`Encountered a duplicate media item name: ${name}`);
        }

        const mediaItemDocument = result[0] as ArangoDocumentForAggregateRoot<MediaItem>;

        const acl = new AccessControlList(mediaItemDocument.queryAccessControlList);

        const doesUserHavePrivilegedAccess =
            !isNullOrUndefined(userWithGroups) &&
            (userWithGroups.isAdmin() ||
                acl.canUser(userWithGroups.id) ||
                userWithGroups.groups.some((group) => acl.canGroup(group.id)));

        if (mediaItemDocument.published || doesUserHavePrivilegedAccess) {
            return {
                ...this.buildViewModel(
                    new MediaItem(mapDatabaseDocumentToAggregateDTO(mediaItemDocument))
                ),
                actions: [],
            };
        }

        /**
         * When the user doesn't have permission, we mimic
         * the case where the resource does not exist.
         */
        return NotFound;
    }

    public async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<WithTags<IMediaItemViewModel>>> {
        const searchResult = await this.fetchManyDomainModels();

        const accessFilter = buildAccessFilter(userWithGroups);

        const validInstances = searchResult.filter(validAggregateOrThrow).filter(accessFilter);

        const entities = validInstances.map((instance) => ({
            ...mixTagsIntoViewModel<IMediaItemViewModel>(
                this.buildViewModel(instance),
                // TODO we may not want to use tags with media items they aren't true resources
                [],
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

    buildViewModel(mediaItem: MediaItem): IMediaItemViewModel {
        const baseApiUrl = `${this.configService.get('BASE_URL')}/${this.configService.get(
            'GLOBAL_PREFIX'
        )}`;

        const baseDigitalAssetUrl = `${baseApiUrl}/resources/mediaItems/download`;

        /**
         * Note that we need to remove `filepath` for security reasons.
         * We currently do so the controller.
         */
        const view = new MediaItemViewModel(mediaItem);

        /**
         * Note that there is no risk of side-effects due to aliasing biting us.
         * View model objects have a short lifetime.
         */
        // @ts-expect-error We may want to relax the read-only constraints.
        delete view.filepath;

        const viewWithoutFilePath = view as unknown as IMediaItemViewModel;

        viewWithoutFilePath.url = `${baseDigitalAssetUrl}/${mediaItem.id}`;

        return viewWithoutFilePath;
    }

    /**
     * TODO We want to move towards fetching the binary as a `StreamableFile`.
     * This method is here to "make it wrong before we make it right". It's a
     * stepping stone that enables us to remove the current (filepath based)
     * logic out of the controller and back into the service layer where it
     * belongs.
     *
     * [See here for streaming files in NestJS](https://docs.nestjs.com/techniques/streaming-files)
     */
    async fetchFilepathForMediaItem(
        systemUser: CoscradUserWithGroups,
        mediaItemId: AggregateId
    ): Promise<Maybe<ResultOrError<FilepathResponse>>> {
        const mediaItem = await this.fetchDomainModelById(mediaItemId);

        if (isNotFound(mediaItem)) {
            return NotFound;
        }

        if (isInternalError(mediaItem)) {
            // TODO include more info if the user is an admin
            throw new InternalError('media item query service encountered an invalid media item');
        }

        const relativeFilePath = mediaItem.getFilePath();

        // TODO Make this configurable
        const STATIC_DIR = `__static__`;

        const fullFilePath = `./${STATIC_DIR}/${relativeFilePath}`;

        if (
            mediaItem.published ||
            (isNonEmptyObject(systemUser) &&
                mediaItem.queryAccessControlList.canUserWithGroups(systemUser))
        ) {
            if (!existsSync(fullFilePath)) {
                return NotFound;
            }

            return {
                root: STATIC_DIR,
                filepath: relativeFilePath,
                mimeType: mediaItem.mimeType,
                filename: isNonEmptyString(mediaItem.title) ? mediaItem.title : 'media-item',
            };
        }

        return NotFound;
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [MediaItem];
    }
}
