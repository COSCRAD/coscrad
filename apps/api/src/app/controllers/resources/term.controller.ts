import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
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

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TermViewModel })
    @Get(`/:id`)
    async fetchById(@Res() res, @Param('id') id: unknown) {
        const searchResult = await this.termQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @Get('')
    async fetchMany() {
        // TODO Eventually, we'll want to build the filter spec based on the user's role \ context
        return this.termQueryService.fetchMany(new IsPublished(true));
    }
}
