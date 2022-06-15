import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { buildByIdApiParamMetadata, RESOURCES_ROUTE_PREFIX } from '../resourceViewModel.controller';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import sendInternalResultAsHttpResponse from './sendInternalResultAsHttpResponse';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(`${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.song)}`)
export class SongController {
    constructor(private readonly songQueryService: SongQueryService) {}

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: SongViewModel })
    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: unknown) {
        const searchResult = await this.songQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @Get('')
    async fetchMany() {
        return this.songQueryService.fetchMany();
    }
}
