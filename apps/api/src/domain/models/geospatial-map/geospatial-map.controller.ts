import {
    Body,
    Controller,
    Get,
    Param,
    Request,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import buildByIdApiParamMetadata from '../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from '../../../app/controllers/resources/common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from '../../../app/controllers/resources/constants';
import { QueryResponseTransformInterceptor } from '../../../app/controllers/response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../../../app/controllers/response-mapping/CoscradExceptions/exception-filters';
import buildViewModelPathForResourceType from '../../../app/controllers/utilities/buildIndexPathForResourceType';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { ResourceType } from '../../types/ResourceType';
import { GeospatialMapQueryService } from './geospatial-map-query.service';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.map))
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class GeospatialMapController {
    constructor(private readonly geospatialMapQueryService: GeospatialMapQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get(`/:id`)
    async fetchById(@Request() req, @Body() res, @Param('id') id: string) {
        const searchResult = await this.geospatialMapQueryService.fetchById(
            id,
            req.user || undefined
        );

        return sendInternalResultAsHttpResponse(res, searchResult);
    }
}
