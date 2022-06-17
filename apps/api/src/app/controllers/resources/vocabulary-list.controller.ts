import { Controller, Get, Injectable, Param, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { VocabularyListViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@Injectable()
@Controller(
    `${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.vocabularyList)}`
)
export class VocabularyListController {
    constructor(private readonly vocabularyListQueryService: VocabularyListQueryService) {}

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: VocabularyListViewModel })
    @Get(`/:id`)
    async fetchById(@Res() res, @Param('id') id: unknown) {
        const searchResult = await this.vocabularyListQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @Get('')
    async fetchMany() {
        // TODO Eventually, we'll want to build the filter spec based on the user's role \ context

        return this.vocabularyListQueryService.fetchMany(new IsPublished(true));
    }
}
