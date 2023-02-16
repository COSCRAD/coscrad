import { Controller, Get, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { VideoQueryService } from '../../../domain/services/query-services/video-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isNotFound } from '../../../lib/types/not-found';
import { VideoViewModel } from '../../../view-models/buildViewModelForResource/viewModels/audio-visual/video.view-model';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { AdminJwtGuard } from '../command/command.controller';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.video))
export class VideoController {
    constructor(private readonly videoQueryService: VideoQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.videoQueryService.fetchMany(req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('validate')
    async validate(@Request() req, @Res() res) {
        const result = await this.videoQueryService.validate(req.user || undefined);

        if (isNotFound(result)) return res.status(httpStatusCodes.notFound).send();

        // Can't we do this more idiomatically with Nest?
        return res.status(httpStatusCodes.ok).send(result);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: VideoViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.videoQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }
}
