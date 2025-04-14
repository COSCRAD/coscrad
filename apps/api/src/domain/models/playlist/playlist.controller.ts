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
import buildByIdApiParamMetadata from '../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import { RESOURCES_ROUTE_PREFIX } from '../../../app/controllers/resources/constants';
import { QueryResponseTransformInterceptor } from '../../../app/controllers/response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../../../app/controllers/response-mapping/CoscradExceptions/exception-filters';
import buildViewModelPathForResourceType from '../../../app/controllers/utilities/buildIndexPathForResourceType';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { PlaylistViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { PlaylistQueryService } from './queries/playlist-query.service';

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
    @ApiOkResponse({ type: PlaylistViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Param('id') id: string) {
        return this.playlistQueryService.fetchById(id, req.user || undefined);
    }
}
