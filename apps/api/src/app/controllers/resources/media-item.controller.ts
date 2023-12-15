import { Controller, Get, Param, Request, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { NotFound, isNotFound } from '../../../lib/types/not-found';
import { MediaItemViewModel } from '../../../queries/buildViewModelForResource/viewModels/media-item.view-model';
import { InternalErrorFilter } from '../command/exception-handling/exception-filters/internal-error.filter';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.mediaItem))
@UseFilters(new InternalErrorFilter())
export class MediaItemController {
    constructor(private readonly mediaItemQueryService: MediaItemQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('/download/:id')
    /**
     * TODO Move this logic to the service layer.
     */
    async fetchBinary(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.mediaItemQueryService.fetchById(id, req.user || undefined);

        if (isInternalError(searchResult) || isNotFound(searchResult))
            return sendInternalResultAsHttpResponse(res, searchResult);

        const filePath = searchResult.filepath;

        const STATIC_DIR = `./__static__`;

        if (!existsSync(`${STATIC_DIR}/${filePath}`)) {
            return sendInternalResultAsHttpResponse(res, NotFound);
        }

        const options = {
            root: STATIC_DIR,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            },
        };

        return res.sendFile(filePath, options);
    }

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
