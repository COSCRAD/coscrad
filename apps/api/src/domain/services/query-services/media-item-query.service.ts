import { Injectable } from '@nestjs/common';
import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class MediaItemQueryService extends BaseQueryService<MediaItem, MediaItemViewModel> {
    constructor(repositoryProvider: RepositoryProvider, commandInfoService: CommandInfoService) {
        super(ResourceType.mediaItem, repositoryProvider, commandInfoService);
    }

    buildViewModel(mediaItem: MediaItem): MediaItemViewModel {
        return new MediaItemViewModel(mediaItem);
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(MediaItem);
    }
}
