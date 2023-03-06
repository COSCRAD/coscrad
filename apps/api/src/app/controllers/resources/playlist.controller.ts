import { ResourceType } from '@coscrad/api-interfaces';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { PlaylistQueryService } from '../../../domain/services/query-services/playlist-query.service';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.video))
export class PlaylistController {
    constructor(private readonly playlistQueryService: PlaylistQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.playlistQueryService.fetchMany(req.user || undefined);
    }
}
