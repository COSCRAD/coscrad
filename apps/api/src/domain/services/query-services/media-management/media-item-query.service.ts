import { IDetailQueryResult, IMediaItemViewModel, WithTags } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { isInternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { MediaItemViewModel } from '../../../../queries/buildViewModelForResource/viewModels/media-item.view-model';
import { ResultOrError } from '../../../../types/ResultOrError';
import BaseDomainModel from '../../../models/BaseDomainModel';
import { MediaItem } from '../../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../../models/shared/functional';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { ResourceType } from '../../../types/ResourceType';
import { ResourceQueryService } from '../resource-query.service';
import { buildAccessFilter } from '../utilities/buildAccessFilter';

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

    async fetchByTitle(
        title: string,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<WithTags<IMediaItemViewModel>>>>> {
        const mediaItemFetchResult = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany();

        const allMediaItems = mediaItemFetchResult.filter(validAggregateOrThrow);

        // TODO Use specification pattern and filter in the DB
        const searchResult = allMediaItems.find((mediaItem) => title === mediaItem.title);

        if (isInternalError(searchResult)) {
            // Database document does not satisfy invariants
            throw searchResult;
        }

        if (isNotFound(searchResult)) return NotFound;

        const isResourceAvailableToUser = buildAccessFilter(userWithGroups);

        if (!isResourceAvailableToUser(searchResult)) return NotFound;
    }
}
