import { Controller, Get, Param, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(`${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.song)}`)
export class SongController {
    constructor(private readonly songQueryService: SongQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: SongViewModel })
    @Get('/:id')
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.songQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.songQueryService.fetchMany(req.user || undefined);
    }
}
