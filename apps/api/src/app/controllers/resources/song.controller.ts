import { Param, Request } from '@nestjs/common';
import { EventSourcedSongViewModel } from '../../../domain/models/song/queries/song.view-model.event.sourced';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { ResourceController } from '../../domain-modules/web-of-knowledge';
import { ResourceDetailEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-detail-endpoint.decorator';
import { ResourceIndexEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-index-endpoint.decorator';

@ResourceController({
    resourceType: ResourceType.song,
})
export class SongController {
    constructor(private readonly songQueryService: SongQueryService) {}

    @ResourceDetailEndpoint({
        ViewModelType: EventSourcedSongViewModel,
    })
    async fetchById(@Request() req, @Param('id') id: string) {
        return this.songQueryService.fetchById(id, req.user || undefined);
    }

    @ResourceIndexEndpoint({
        ViewModelType: EventSourcedSongViewModel,
    })
    async fetchMany(@Request() req) {
        const result = await this.songQueryService.fetchMany(req?.user || undefined);

        return result;
    }
}
