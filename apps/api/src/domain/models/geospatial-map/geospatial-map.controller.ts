import {
    Body,
    Get,
    NotImplementedException,
    Param,
    Request,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import buildByIdApiParamMetadata from '../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import { UserQueryOptions } from '../../../app/controllers/resources/term.controller';
import { QueryResponseTransformInterceptor } from '../../../app/controllers/response-mapping';
import { ResourceController } from '../../../app/domain-modules/web-of-knowledge';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { ResourceType } from '../../types/ResourceType';
import { GeospatialMapQueryService } from './geospatial-map-query.service';

@ResourceController({
    resourceType: ResourceType.map,
})
@UseInterceptors(QueryResponseTransformInterceptor)
export class GeospatialMapController {
    constructor(private readonly geospatialMapQueryService: GeospatialMapQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get(`/:id`)
    async fetchById(@Request() req, @Param('id') id: string) {
        const searchResult = await this.geospatialMapQueryService.fetchById(
            id,
            req.user || undefined
        );

        return searchResult;
    }

    async fetchMany(@Request() _req, @Body() _userQueryOptions?: UserQueryOptions) {
        throw new NotImplementedException();
    }
}
