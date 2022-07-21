import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Tag } from '../../domain/models/tag/tag.entity';
import { isAggregateId } from '../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { isNotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import { TagViewModel } from '../../view-models/buildViewModelForResource/viewModels';
import httpStatusCodes from '../constants/httpStatusCodes';

@ApiTags('tags')
@Controller('tags')
export class TagController {
    constructor(private readonly repositoryProvider: RepositoryProvider) {}

    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: string) {
        if (!isAggregateId(id))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid tag ID: ${id}`));

        const result = await this.repositoryProvider.getTagRepository().fetchById(id);

        if (isInternalError(result)) return res.status(httpStatusCodes.badRequest).send(result);

        if (isNotFound(result)) return res.status(httpStatusCodes.notFound).send();

        const viewModel = cloneToPlainObject(new TagViewModel(result));

        return res.status(httpStatusCodes.ok).send(viewModel);
    }

    @Get('')
    async fetchMay(@Res() res) {
        const result = await this.repositoryProvider.getTagRepository().fetchMany();

        const allErrors = result.filter(isInternalError);

        if (allErrors.length > 0)
            return res
                .status(httpStatusCodes.internalError)
                .send(allErrors.reduce((msg, error) => msg + '\n' + error.toString(), ''));

        // Can we make the above condition a typeguard and avoid casting?
        const allTags = result as Tag[];

        const viewModels = allTags.map((tag) => new TagViewModel(tag));

        return res.status(httpStatusCodes.ok).send(viewModels);
    }
}
