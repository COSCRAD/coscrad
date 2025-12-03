import { IIndexQueryResult, INoteViewModel } from '@coscrad/api-interfaces';
import { Controller, Get, Param, Post, Req, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { AggregateId } from '../../domain/types/AggregateId';
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

    @Get('/:id')
    async fetchById(@Param('id') id: AggregateId) {
        return this.edgeConnectionQueryService.fetchById(id);
    }

    @Post('')
    async fetchManyNotes(@Req() _req): Promise<IIndexQueryResult<INoteViewModel>> {
        const allNotes = await this.edgeConnectionQueryService.fetchMany();

        return allNotes;
    }
}
