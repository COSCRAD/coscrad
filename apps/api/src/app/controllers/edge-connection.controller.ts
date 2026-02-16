import { IDetailQueryResult, IIndexQueryResult, INoteViewModel } from '@coscrad/api-interfaces';
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
import { isInternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound } from '../../lib/types/not-found';
import { ResultOrError } from '../../types/ResultOrError';
import buildByIdApiParamMetadata from './resources/common/buildByIdApiParamMetadata';
import { QueryResponseTransformInterceptor } from './response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from './response-mapping/CoscradExceptions/exception-filters';

@ApiTags('web of knowledge (edge connections and notes)')
@Controller('webOfKnowledge')
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class EdgeConnectionController {
    constructor(private readonly edgeConnectionQueryService: EdgeConnectionQueryService) {}

    // TODO Publish view schemas directly or via API docs
    // @Get('/schema')
    // async getSchema() {
    //     return this.edgeConnectionQueryService.fetchSchema();
    // }

    /**
     * TODO We need to return standardized query resuponses here (`IDetailQueryResult<INoteViewModel>`).
     *
     */
    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get('/:id')
    async fetchById(
        @Req() req,
        @Param('id') id: AggregateId
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<INoteViewModel>>>> {
        const result = await this.edgeConnectionQueryService.fetchById(id, req.user || undefined);

        if (isInternalError(result) || isNotFound(result)) {
            return result;
        }

        return {
            ...result,
            // TODO If using the dynamic command forms for the note admin flow, we will need to return this
            actions: [],
        };
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Post('')
    async fetchManyNotes(@Req() req): Promise<ResultOrError<IIndexQueryResult<INoteViewModel>>> {
        const allNotes = await this.edgeConnectionQueryService.fetchMany(req?.user || undefined);

        return allNotes;
    }
}
