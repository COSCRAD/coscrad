import { Controller, Get, Param, Res, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { isNotFound } from '../../../lib/types/not-found';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { InternalErrorFilter } from '../exception-handling/exception-filters/internal-error.filter';
import { buildByIdApiParamMetadata, RESOURCES_ROUTE_PREFIX } from '../resourceViewModel.controller';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(
    `${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.mediaItem)}`
)
@UseFilters(new InternalErrorFilter())
export class MediaItemController {
    constructor(private readonly mediaItemQueryService: MediaItemQueryService) {}

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: MediaItemViewModel })
    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: unknown) {
        const searchResult = await this.mediaItemQueryService.fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.badRequest).send(searchResult.toString());

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        return res.status(httpStatusCodes.ok).send(searchResult);
    }

    @Get('')
    async fetchMany() {
        return this.mediaItemQueryService.fetchMany();
    }
}
