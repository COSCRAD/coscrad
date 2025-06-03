import { ResourceType } from '@coscrad/api-interfaces';
import { Param, Request } from '@nestjs/common';
import { PlaylistQueryService } from '../../../domain/services/query-services/playlist-query.service';
import { PlaylistViewModel } from '../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { ResourceController } from '../../domain-modules/web-of-knowledge';
import { ResourceDetailEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-detail-endpoint.decorator';
import { ResourceIndexEndpoint } from '../../domain-modules/web-of-knowledge/decorators/resource-index-endpoint.decorator';

@ResourceController({
    resourceType: ResourceType.playlist,
})
export class PlaylistController {
    constructor(private readonly playlistQueryService: PlaylistQueryService) {}

    @ResourceDetailEndpoint({
        ViewModelType: PlaylistViewModel,
    })
    async fetchById(@Request() req, @Param('id') id: string) {
        return this.playlistQueryService.fetchById(id, req.user || undefined);
    }

    @ResourceIndexEndpoint({
        ViewModelType: PlaylistViewModel,
    })
    async fetchMany(@Request() req) {
        return this.playlistQueryService.fetchMany(req.user || undefined);
    }
}
