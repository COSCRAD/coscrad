import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { NOTE_INDEX_ROUTE } from './constants';

/**
 * TODO We need to return standardized query resuponses here (`IIndexQueryResult`
 * and `IDetailQueryResult`).
 *
 * Further, we need to use a query service to
 * extract the internal logic from the controller. The controller should
 * simply adapt to HTTP.
 */
@ApiTags('web of knowledge (edge connections)')
@Controller(NOTE_INDEX_ROUTE)
export class EdgeConnectionController {
    constructor(private readonly edgeConnectionQueryService: EdgeConnectionQueryService) {}

    @Get('')
    async getSchema() {
        return this.edgeConnectionQueryService.fetchSchema();
    }

    @Get('notes')
    async fetchManyNotes() {
        return this.edgeConnectionQueryService.fetchMany();
    }
}
