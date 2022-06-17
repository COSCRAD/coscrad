import { Controller, Get, Param, Res, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { InternalErrorFilter } from '../exception-handling/exception-filters/internal-error.filter';
import { buildByIdApiParamMetadata, RESOURCES_ROUTE_PREFIX } from '../resourceViewModel.controller';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import sendInternalResultAsHttpResponse from './sendInternalResultAsHttpResponse';

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

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @Get('')
    async fetchMany() {
        // TODO Eventually, we'll want to build the filter spec based on the user's role \ context
        return this.mediaItemQueryService.fetchMany(new IsPublished(true));
    }
}
