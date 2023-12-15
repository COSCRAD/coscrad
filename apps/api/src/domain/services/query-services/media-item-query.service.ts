import { Injectable } from '@nestjs/common';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import clonePlainObjectWithoutProperty from '../../../lib/utilities/clonePlainObjectWithoutProperty';
import { MediaItemViewModel } from '../../../queries/buildViewModelForResource/viewModels/media-item.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class MediaItemQueryService extends ResourceQueryService<MediaItem, MediaItemViewModel> {
    protected readonly type = ResourceType.mediaItem;

    buildViewModel(mediaItem: MediaItem): MediaItemViewModel {
        const mediaItemWithHiddenProperties = new MediaItemViewModel(mediaItem);

        // @ts-expect-error TODO Fix this
        return clonePlainObjectWithoutProperty(
            mediaItemWithHiddenProperties as unknown as Record<string, unknown>,
            'filepath'
        );
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [MediaItem];
    }
}
