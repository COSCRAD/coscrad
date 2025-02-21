import { convertCoscradSchemaToOpenApiFormat, getCoscradDataSchema } from '@coscrad/data-types';
import { Controller, Get, Param, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { VocabularyListViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.vocabularyList))
export class VocabularyListController {
    constructor(private readonly vocabularyListQueryService: VocabularyListQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: VocabularyListViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: string) {
        const searchResult = await this.vocabularyListQueryService.fetchById(
            id,
            req.user || undefined
        );

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOkResponse({
        schema: convertCoscradSchemaToOpenApiFormat(getCoscradDataSchema(VocabularyListViewModel)),
    })
    @Get('')
    async fetchMany(@Request() req) {
        return this.vocabularyListQueryService.fetchMany(req.user || undefined);
    }
}
