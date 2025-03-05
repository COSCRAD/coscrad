import { IMediaItemViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, MIMEType } from '@coscrad/data-types';
import { BaseViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base.view-model';
import { MediaItem } from '../entities/media-item.entity';

const FromMediaItem = FromDomainModel(MediaItem);

export class MediaItemViewModel extends BaseViewModel implements IMediaItemViewModel {
    @FromMediaItem
    readonly url: string;

    @FromMediaItem
    readonly mimeType: MIMEType;

    @FromMediaItem
    readonly lengthMilliseconds: number;

    readonly filepath: string;

    constructor(mediaItem: MediaItem) {
        const { url, mimeType, lengthMilliseconds } = mediaItem;

        super(mediaItem);

        this.url = url;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;

        // Note that we remove this before returning query results for security
        this.filepath = mediaItem.getFilePath();
    }
}
