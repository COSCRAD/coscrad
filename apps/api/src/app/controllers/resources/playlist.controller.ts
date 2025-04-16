import { ResourceType } from '@coscrad/api-interfaces';
import {
    Controller,
    Get,
    Param,
    Request,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { PlaylistQueryService } from '../../../domain/services/query-services/playlist-query.service';
import { StateBasedPlaylistViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { QueryResponseTransformInterceptor } from '../response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../response-mapping/CoscradExceptions/exception-filters';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.playlist))
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class PlaylistController {
    constructor(private readonly playlistQueryService: PlaylistQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.playlistQueryService.fetchMany(req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: StateBasedPlaylistViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Param('id') id: unknown) {
        return this.playlistQueryService.fetchById(id, req.user || undefined);
    }
}
