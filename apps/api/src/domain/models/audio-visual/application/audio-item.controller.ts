import { Param, Request } from '@nestjs/common';
import { ResourceController } from '../../../../app/domain-modules/web-of-knowledge';
import { ResourceDetailEndpoint } from '../../../../app/domain-modules/web-of-knowledge/decorators/resource-detail-endpoint.decorator';
import { ResourceIndexEndpoint } from '../../../../app/domain-modules/web-of-knowledge/decorators/resource-index-endpoint.decorator';
import { AudioItemQueryService } from '../../../services/query-services/audio-item-query.service';
import { ResourceType } from '../../../types/ResourceType';
import { EventSourcedAudioItemViewModel } from '../audio-item/queries';

@ResourceController({
    resourceType: ResourceType.audioItem,
    baseRouteOverride: `audioItems`,
})
export class AudioItemController {
    constructor(private readonly audioItemQueryService: AudioItemQueryService) {}

    @ResourceDetailEndpoint({
        ViewModelType: EventSourcedAudioItemViewModel,
    })
    async fetchById(@Request() req, @Param('id') id: string) {
        return this.audioItemQueryService.fetchById(id, req.user || undefined);
    }

    @ResourceIndexEndpoint({
        ViewModelType: EventSourcedAudioItemViewModel,
    })
    async fetchMany(@Request() req) {
        return this.audioItemQueryService.fetchMany(req.user || undefined);
    }
}
