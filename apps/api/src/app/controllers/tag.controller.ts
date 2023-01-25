import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../authorization/optional-jwt-auth-guard';
import { TagQueryService } from '../../domain/services/query-services/tag-query.service';
import { isAggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { TagViewModel } from '../../view-models/buildViewModelForResource/viewModels';
import httpStatusCodes from '../constants/httpStatusCodes';
import buildByIdApiParamMetadata from './resources/common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';

export const TAG_INDEX_ROUTE = 'tags';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
@ApiTags('tags')
@Controller(TAG_INDEX_ROUTE)
export class TagController {
    constructor(private readonly tagQueryService: TagQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TagViewModel })
    @Get('/:id')
    async fetchById(@Req() req, @Res() res, @Param('id') id: string) {
        if (!isAggregateId(id))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid tag ID: ${id}`));

        const result = await this.tagQueryService.fetchById(id, req.user);

        return sendInternalResultAsHttpResponse(res, result);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Req() req, @Res() res) {
        const result = await this.tagQueryService.fetchMany(req?.user || undefined);

        return sendInternalResultAsHttpResponse(res, result);
    }
}
