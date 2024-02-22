import { Controller, Get, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import httpStatusCodes from '../../../../app/constants/httpStatusCodes';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import buildByIdApiParamMetadata from '../../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from '../../../../app/controllers/resources/common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from '../../../../app/controllers/resources/constants';
import buildViewModelPathForResourceType from '../../../../app/controllers/utilities/buildIndexPathForResourceType';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { isNotFound } from '../../../../lib/types/not-found';
import { VideoViewModel } from '../../../../queries/buildViewModelForResource/viewModels/audio-visual/video.view-model';
import { VideoQueryService } from '../../../services/query-services/video-query.service';
import { ResourceType } from '../../../types/ResourceType';

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
