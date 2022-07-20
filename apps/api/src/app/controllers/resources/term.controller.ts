import { Controller, Get, Param, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { TermViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(`${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.term)}`)
export class TermController {
    constructor(private readonly termQueryService: TermQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TermViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.termQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.termQueryService.fetchMany(req.user || undefined);
    }
}
