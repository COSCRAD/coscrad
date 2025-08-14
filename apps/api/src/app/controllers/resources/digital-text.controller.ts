import { ResourceType } from '@coscrad/api-interfaces';
import { isUUID } from '@coscrad/validation-constraints';
import { Controller, Get, Param, Request, UseFilters } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { InternalError } from '../../../lib/errors/InternalError';
import { DigitalTextQueryService, DigitalTextViewModel } from '../../../queries/digital-text';
import { ResourceDetailEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-detail-endpoint.decorator';
import { ResourceIndexEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-index-endpoint.decorator';
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
export class DigitalTextQueryController {
    constructor(private readonly digitalTextQueryService: DigitalTextQueryService) {}

    @ResourceDetailEndpoint({
        ViewModelType: DigitalTextViewModel,
    })
    // TODO Consider an `@CoscradQueryIdParam` decorator.
    async fetchById(@Request() req, @Param(ID) id: unknown) {
        // TODO Use validation pipe for this
        if (!isUUID(id)) return new InternalError(`the parameter: ${ID} must be a UUID`);

        return this.digitalTextQueryService.fetchById(id, req.user || undefined);
    }

    @ResourceIndexEndpoint({
        ViewModelType: DigitalTextViewModel,
    })
    async fetchMany(@Request() req) {
        return this.digitalTextQueryService.fetchMany(req.user || undefined);
    }

    // @ApiBearerAuth('JWT')
    // @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get(`pages/:id`)
    async fetchPagesByDigitalTextId(@Request() req, @Param(ID) id: string) {
        if (!isUUID(id)) return new InternalError(`the parameter: ${id} must be a UUID`);

        const result = await this.digitalTextQueryService.fetchById(id);

        return {
            id: id,
            digitalText: result,
        };
    }
}
