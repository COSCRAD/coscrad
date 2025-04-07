import { IMediaItemViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, MIMEType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { BaseViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base.view-model';
import { MediaItem } from '../entities/media-item.entity';

const FromMediaItem = FromDomainModel(MediaItem);

/**
 * Note that we build the `url` dynamically in the query service as we need the
 * config to get the base url.
 */
export class MediaItemViewModel extends BaseViewModel implements Omit<IMediaItemViewModel, 'url'> {
    @FromMediaItem
    readonly mimeType: MIMEType;

    @FromMediaItem
    readonly lengthMilliseconds: number;

    @FromMediaItem
    readonly dimensions: { heightPx: number; widthPx: number };

    readonly filepath: string;

    constructor(mediaItem: MediaItem) {
        const { mimeType, lengthMilliseconds, dimensions } = mediaItem;

        super(mediaItem);

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;

        if (isNonEmptyObject(dimensions)) {
            this.dimensions = {
                heightPx: dimensions.heightPx,
                widthPx: dimensions.widthPx,
            };
        }

        // Note that we remove this before returning query results for security
        this.filepath = mediaItem.getFilePath();
    }
}
