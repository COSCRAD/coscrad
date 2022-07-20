import { Controller, Get, Param, Request, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { InternalErrorFilter } from '../exception-handling/exception-filters/internal-error.filter';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(
    `${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.mediaItem)}`
)
@UseFilters(new InternalErrorFilter())
export class MediaItemController {
    constructor(private readonly mediaItemQueryService: MediaItemQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: MediaItemViewModel })
    @Get('/:id')
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.mediaItemQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.mediaItemQueryService.fetchMany(req.user || undefined);
    }
}
