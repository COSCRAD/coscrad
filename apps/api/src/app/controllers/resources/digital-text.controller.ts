import { isUUID } from '@coscrad/validation-constraints';
import { Param, Request } from '@nestjs/common';
import { ResourceType } from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import { DigitalTextQueryService, DigitalTextViewModel } from '../../../queries/digital-text';
import { ResourceController } from '../../domain-modules/web-of-knowledge';
import { ResourceDetailEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-detail-endpoint.decorator';
import { ResourceIndexEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-index-endpoint.decorator';

const ID = 'id';

@ResourceController({
    resourceType: ResourceType.digitalText,
})
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
}
