import { getCoscradDataSchema, validateFieldPathForCoscradModel } from '@coscrad/data-types';
import { Body, Controller, Post, Request, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoscradContributorQueryService } from '../../domain/models/user-management/contributor/queries/coscrad-contributor-query.service';
import { InternalError } from '../../lib/errors/InternalError';
import { CoscradContributorViewModel } from '../../queries/buildViewModelForResource/viewModels/coscrad-contributor.view-model';
import { extractPathsFromUserFilter, UserQueryOptions } from './resources/term.controller';
import { QueryResponseTransformInterceptor } from './response-mapping';
import { CoscradInvalidUserInputException } from './response-mapping/CoscradExceptions';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from './response-mapping/CoscradExceptions/exception-filters';

export const CONTRIBUTOR_INDEX_ROUTE = 'contributors';

@ApiTags('contributors')
@Controller(CONTRIBUTOR_INDEX_ROUTE)
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class CoscradContributorController {
    constructor(private readonly coscradContributorService: CoscradContributorQueryService) {}

    // @ApiBearerAuth('JWT')
    // @UseGuards(AdminJwtGuard)
    @Post('')
    async fetchMany(@Request() req, @Body() userQueryOptions?: UserQueryOptions) {
        const { filter } = userQueryOptions || {};

        if (filter) {
            const schema = getCoscradDataSchema(CoscradContributorViewModel);

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

        const result = await this.coscradContributorService.fetchMany(userQueryOptions);

        return result;
    }
}
