import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagQueryService } from '../../domain/services/query-services/tag-query.service';
import { isAggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import httpStatusCodes from '../constants/httpStatusCodes';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';

export const TAG_INDEX_ROUTE = 'tags';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 *
 * Also, we should break the logic here out into a query services, as is done for other aggregates.
 */
@ApiTags('tags')
@Controller(TAG_INDEX_ROUTE)
export class TagController {
    constructor(private readonly tagQueryService: TagQueryService) {}

    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: string) {
        if (!isAggregateId(id))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid tag ID: ${id}`));

        const result = await this.tagQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, result);
    }

    @Get('')
    async fetchMany(@Res() res) {
        const result = await this.tagQueryService.fetchMany();

        return sendInternalResultAsHttpResponse(res, result);
    }
}
