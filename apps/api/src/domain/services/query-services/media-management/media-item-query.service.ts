import { Injectable } from '@nestjs/common';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { MediaItemViewModel } from '../../../../queries/buildViewModelForResource/viewModels/media-item.view-model';
import BaseDomainModel from '../../../models/BaseDomainModel';
import { MediaItem } from '../../../models/media-item/entities/media-item.entity';
import { ResourceType } from '../../../types/ResourceType';
import { ResourceQueryService } from '../resource-query.service';

@Injectable()
export class MediaItemQueryService extends ResourceQueryService<MediaItem, MediaItemViewModel> {
    protected readonly type = ResourceType.mediaItem;

    buildViewModel(mediaItem: MediaItem): MediaItemViewModel {
        /**
         * Note that we need to remove `filepath` for security reasons.
         * We currently do so the controller.
         */
        return new MediaItemViewModel(mediaItem);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [MediaItem];
    }
}
