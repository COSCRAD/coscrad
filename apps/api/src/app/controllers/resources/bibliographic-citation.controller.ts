import { Controller, Get, Param, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { BibliographicCitationQueryService } from '../../../domain/services/query-services/bibliographic-citation-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { BibliographicCitationViewModel } from '../../../queries/buildViewModelForResource/viewModels/bibliographic-citation/bibliographic-citation.view-model';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.bibliographicCitation))
export class BibliographicCitationController {
    constructor(
        private readonly bibliographicCitationQueryService: BibliographicCitationQueryService
    ) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: BibliographicCitationViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.bibliographicCitationQueryService.fetchById(
            id,
            req.user || undefined
        );

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.bibliographicCitationQueryService.fetchMany(req.user || undefined);
    }
}
