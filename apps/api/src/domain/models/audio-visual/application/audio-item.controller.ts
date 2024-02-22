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
import { AudioItemViewModel } from '../../../../queries/buildViewModelForResource/viewModels/audio-visual/audio-item.view-model';
import { AudioItemQueryService } from '../../../services/query-services/audio-item-query.service';
import { ResourceType } from '../../../types/ResourceType';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.audioItem))
export class AudioItemController {
    constructor(private readonly audioItemQueryService: AudioItemQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.audioItemQueryService.fetchMany(req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('validate')
    async validate(@Request() req, @Res() res) {
        const result = await this.audioItemQueryService.validate(req.user || undefined);

        if (isNotFound(result)) return res.status(httpStatusCodes.notFound).send();

        return res.status(httpStatusCodes.ok).send(result);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: AudioItemViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.audioItemQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }
}
