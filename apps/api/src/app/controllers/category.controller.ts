import { Controller, Get, Inject, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Category } from '../../domain/models/categories/entities/category.entity';
import { IRepositoryProvider } from '../../domain/repositories/interfaces/repository-provider.interface';
import { isInternalError } from '../../lib/errors/InternalError';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { REPOSITORY_PROVIDER_TOKEN } from '../../persistence/constants/persistenceConstants';
import { CategoryTreeViewModel } from '../../view-models/buildViewModelForResource/viewModels/category-tree.view-model';
import httpStatusCodes from '../constants/httpStatusCodes';
import { CATEGORY_TREE_INDEX_ROUTE } from './constants';

/**
 * TODO [https://www.pivotaltracker.com/story/show/184098924]
 * We need a `CategoryQueryService`.
 */
@ApiTags('tree of knowledge (categories)')
@Controller(CATEGORY_TREE_INDEX_ROUTE)
export class CategoryController {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider
    ) {}

    // TODO Accept category ID and return corresponding subtree
    @Get('')
    async fetchTree(@Res() res) {
        const result = await this.repositoryProvider.getCategoryRepository().fetchTree();

        const invariantValidationErrors = result.filter(isInternalError);

        if (invariantValidationErrors.length > 0) {
            return res
                .status(httpStatusCodes.internalError)
                .send(invariantValidationErrors.toString());
        }

        const tree = result as Category[];

        const treeViewModel = new CategoryTreeViewModel(tree);

        return res.status(httpStatusCodes.ok).send(cloneToPlainObject(treeViewModel));
    }
}
