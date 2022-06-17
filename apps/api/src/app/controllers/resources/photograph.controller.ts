import { Controller, Get, Injectable, Param, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { PhotographQueryService } from '../../../domain/services/query-services/photograph-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { PhotographViewModel } from '../../../view-models/buildViewModelForResource/viewModels/photograph.view-model';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@Injectable()
@Controller(
    `${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.photograph)}`
)
export class PhotographController {
    constructor(private readonly photographQueryService: PhotographQueryService) {}

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: PhotographViewModel })
    @Get(`/:id`)
    async fetchById(@Res() res, @Param('id') id: unknown) {
        const searchResult = await this.photographQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @Get('')
    async fetchMany() {
        // TODO Eventually, we'll want to build the filter spec based on the user's role \ context

        return this.photographQueryService.fetchMany(new IsPublished(true));
    }
}
