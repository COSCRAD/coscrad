import { IDetailQueryResult, IIndexQueryResult, ITagViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { TagViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { Tag } from '../../models/tag/tag.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../types/AggregateId';

/**
 * TODO [https://www.pivotaltracker.com/story/show/184098960]
 * Inherit from the base query service.
 */
export class TagQueryService {
    constructor(
        @Inject(RepositoryProvider) private readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService
    ) {}

    async fetchById(
        id: AggregateId
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<ITagViewModel>>>> {
        const result = await this.repositoryProvider.getTagRepository().fetchById(id);

        if (isInternalError(result)) return result;

        if (isNotFound(result)) return NotFound;

        /**
         * Remove any methods \ private data.
         */
        return {
            // TODO type the following!
            ...(cloneToPlainObject(new TagViewModel(result)) as TagViewModel),
            actions: this.commandInfoService.getCommandInfo(result),
        };
    }

    async fetchMany(): Promise<ResultOrError<IIndexQueryResult<ITagViewModel>>> {
        const result = await this.repositoryProvider.getTagRepository().fetchMany();

        const allErrors = result.filter(isInternalError);

        if (allErrors.length > 0)
            return new InternalError(
                `Failed to fetch tags due to invalid database state`,
                allErrors
            );

        // Can we make the above condition a typeguard and avoid casting?
        const allTags = result as Tag[];

        return {
            entities: allTags.map((tag) => ({
                ...cloneToPlainObject(new TagViewModel(tag)),
                actions: this.commandInfoService.getCommandInfo(tag),
            })),
            indexScopedActions: this.commandInfoService.getCommandInfo(Tag),
        };
    }
}
