import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class MediaItemQueryService extends ResourceQueryService<MediaItem, MediaItemViewModel> {
    protected readonly type = ResourceType.mediaItem;

    buildViewModel(mediaItem: MediaItem): MediaItemViewModel {
        return new MediaItemViewModel(mediaItem);
    }

    getInfoForIndexScopedCommands(): ICommandFormAndLabels[] {
        return this.commandInfoService.getCommandInfo(MediaItem);
    }
}
