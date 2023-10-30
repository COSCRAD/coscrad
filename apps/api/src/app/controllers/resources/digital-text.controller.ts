import { isUUID } from '@coscrad/validation-constraints';
import {
    Controller,
    Get,
    Param,
    Request,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { ResourceType } from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import { DigitalTextQueryService, DigitalTextViewModel } from '../../../queries/digital-text';
import { QueryResponseTransformInterceptor } from '../response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../response-mapping/CoscradExceptions/exception-filters';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import { RESOURCES_ROUTE_PREFIX } from './constants';

const ID = 'id';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.digitalText))
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class DigitalTextQueryController {
    constructor(private readonly digitalTextQueryService: DigitalTextQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({
        type: DigitalTextViewModel,
    })
    @Get(`:${ID}`)
    // TODO Consider an `@CoscradQueryIdParam` decorator.
    async fetchById(@Request() req, @Param(ID) id: unknown) {
        // TODO Use validation pipe for this
        if (!isUUID(id)) return new InternalError(`the parameter: ${ID} must be a UUID`);

        return this.digitalTextQueryService.fetchById(id, req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        return this.digitalTextQueryService.fetchMany(req.user || undefined);
    }
}
