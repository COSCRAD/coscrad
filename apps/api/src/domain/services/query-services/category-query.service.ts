import { ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../types/ResultOrError';
import { CategoryTreeViewModel } from '../../../view-models/buildViewModelForResource/viewModels/category-tree.view-model';
import { Category } from '../../models/categories/entities/category.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';

export class CategoryQueryService {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider
    ) {}

    async fetchTree(): Promise<ResultOrError<ICategoryTreeViewModel>> {
        const fetchResult = await this.repositoryProvider.getCategoryRepository().fetchTree();

        const invariantValidationErrors = fetchResult.filter(isInternalError);

        if (invariantValidationErrors.length > 0)
            return new InternalError(
                `Found one or more invalid category nodes: \n`,
                invariantValidationErrors
            );

        const tree = fetchResult as Category[];

        return new CategoryTreeViewModel(tree);
    }
}
