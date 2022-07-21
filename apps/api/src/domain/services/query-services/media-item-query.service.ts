import { Injectable } from '@nestjs/common';
import { CommandInfo } from '../../../app/controllers/command/services/command-info-service';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class MediaItemQueryService extends BaseQueryService<MediaItem, MediaItemViewModel> {
    protected readonly type = ResourceType.mediaItem;

    buildViewModel(mediaItem: MediaItem): MediaItemViewModel {
        return new MediaItemViewModel(mediaItem);
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(MediaItem);
    }
}
