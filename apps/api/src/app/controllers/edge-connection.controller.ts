import {
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../authorization/optional-jwt-auth-guard';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { AggregateId } from '../../domain/types/AggregateId';
import buildByIdApiParamMetadata from './resources/common/buildByIdApiParamMetadata';
import { QueryResponseTransformInterceptor } from './response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from './response-mapping/CoscradExceptions/exception-filters';

/**
 * TODO We need to return standardized query resuponses here (`IIndexQueryResult`
 * and `IDetailQueryResult`).
 *
 */
@ApiTags('web of knowledge (edge connections)')
@Controller('webOfKnowledge')
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class EdgeConnectionController {
    constructor(private readonly edgeConnectionQueryService: EdgeConnectionQueryService) {}

    @Get('')
    async getSchema() {
        return this.edgeConnectionQueryService.fetchSchema();
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get('/:id')
    async fetchById(@Req() req, @Param('id') id: AggregateId) {
        return this.edgeConnectionQueryService.fetchById(id, req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Post('')
    async fetchManyNotes(@Req() req) {
        const allNotes = await this.edgeConnectionQueryService.fetchMany(req?.user || undefined);

        return allNotes;
    }
}
