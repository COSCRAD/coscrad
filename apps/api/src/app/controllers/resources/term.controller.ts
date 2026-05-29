import { LanguageCode } from '@coscrad/api-interfaces';
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
    ALL_PROPERTIES_SEARCH_KEY,
    IndexSearchScope,
    interpretCoscradQueryFromUserSearchText,
    IUserDefinedFilter,
} from '../../../lib/coscrad-query-language/compiler';
import {
    CoscradAndCondition,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradSimpleCondition,
} from '../../../lib/coscrad-query-language/models/coscrad-filter-condition';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
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

/**
 * TODO an alternative format is
 * Record<keyof TViewModel,string>
 * + operator: 'AND' | 'OR'
 */
export interface ClientQuery<TViewModel extends Object> {
    // TODO leave this empty to search all?
    scope: IndexSearchScope<TViewModel>;
    // e.g. "<10"
    query: string;
    // TODO remove this?
    defaultLanguageCode?: LanguageCode;
}

// do this now
// TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-327] Make this a DTO class
export interface UserQueryOptions<T> {
    // TODO change this to `query` or `queryString`
    filter: ClientQuery<T>;
    pagination: PaginationOptions;
    // TODO We should inject this into the query service \ controller via a server-side config
    defaultLanguageCode: LanguageCode;
    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-328] Support custom user-defined sort order
}

// TODO where was this used?
const _extractPathsFromUserFilter = (filter: CoscradFilterCondition, paths = []): string[] => {
    const { type } = filter;

    if (type === CoscradConditionBlockType.SIMPLE) {
        paths.push((filter as CoscradSimpleCondition).field);

        return paths;
    }

    if (type === CoscradConditionBlockType.AND || type === CoscradConditionBlockType.OR) {
        (filter as CoscradAndCondition).conditions.forEach((condition) => {
            paths.push(..._extractPathsFromUserFilter(condition));
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
    // ITermViewModel ?
    async fetchMany(@Request() req, @Body() userQueryOptions?: UserQueryOptions<TermViewModel>) {
        // todo change incoming name?
        const { filter: userSearchSpecification } = userQueryOptions || {};

        let filter: IUserDefinedFilter | null;

        if (userSearchSpecification) {
            const schema = getCoscradDataSchema(TermViewModel);

            const { scope } = userSearchSpecification;

            /**
             * Here we check the user defined scope (property to search) against
             * an allow list for the model. This avoids injections attacks via
             * the field names. Paramters are escaped via `bindVars` when
             * compiling AQL queries.
             */
            if (scope !== ALL_PROPERTIES_SEARCH_KEY) {
                const scopeValidationErrors = validateFieldPathForCoscradModel(scope, schema);

                if (scopeValidationErrors.length > 0) {
                    return new CoscradInvalidUserInputException(
                        new InternalError(
                            `Encountered an invalid filter condition on user-defined query`,
                            scopeValidationErrors.map(({ message }) => new InternalError(message))
                        )
                    );
                }
            }

            const filterBuildResult =
                interpretCoscradQueryFromUserSearchText(userSearchSpecification);

            if (isInternalError(filterBuildResult)) {
                // TODO wrap bad user input
                return filterBuildResult;
            }

            filter = filterBuildResult;
        }

        const result = await this.termQueryService.fetchMany(
            // TODO combine these parameters
            req.user || undefined,
            {
                filter,
                pagination: userQueryOptions.pagination,
            }
        );

        return result;
    }
}
