import { getCoscradDataSchema, validateFieldPathForCoscradModel } from '@coscrad/data-types';
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    Res,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import {
    CoscradAndCondition,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradSimpleCondition,
} from '../../../lib/coscrad-query-language/models/coscrad-filter-condition';
import { InternalError } from '../../../lib/errors/InternalError';
import { TermViewModel } from '../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { QueryResponseTransformInterceptor } from '../response-mapping';
import { CoscradInvalidUserInputException } from '../response-mapping/CoscradExceptions';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../response-mapping/CoscradExceptions/exception-filters';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

export type PaginationOptions = {
    size: number;
    page: number;
};

// TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-327] Make this a DTO class
export interface UserQueryOptions {
    filter: CoscradFilterCondition;
    pagination: PaginationOptions;
    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-328] Support custom user-defined sort order
}

const extractPathsFromUserFilter = (filter: CoscradFilterCondition, paths = []): string[] => {
    const { type } = filter;

    if (type === CoscradConditionBlockType.SIMPLE) {
        paths.push((filter as CoscradSimpleCondition).field);

        return paths;
    }

    if (type === CoscradConditionBlockType.AND || type === CoscradConditionBlockType.OR) {
        (filter as CoscradAndCondition).conditions.forEach((condition) => {
            paths.push(...extractPathsFromUserFilter(condition));
        });

        return paths;
    }

    throw new InternalError(`Unsupported filter condition type: ${type} for filter: ${filter}`);
};

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.term))
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class TermController {
    constructor(private readonly termQueryService: TermQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    // TODO Restore docs
    // @ApiOkResponse({ type: TermViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: string) {
        const searchResult = await this.termQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Post('')
    async fetchMany(@Request() req, @Body() userQueryOptions?: UserQueryOptions) {
        const { filter } = userQueryOptions || {};

        if (filter) {
            const schema = getCoscradDataSchema(TermViewModel);

            const allPaths = extractPathsFromUserFilter(filter);

            const result = allPaths.flatMap((path) =>
                validateFieldPathForCoscradModel(path, schema)
            );

            if (result.length > 0) {
                return new CoscradInvalidUserInputException(
                    new InternalError(
                        `Encountered an invalid filter condition on user-defined query`,
                        result.map(({ message }) => new InternalError(message))
                    )
                );
            }
        }

        const result = await this.termQueryService.fetchMany(
            // TODO combine these parameters
            req.user || undefined,
            userQueryOptions
        );

        return result;
    }
}
