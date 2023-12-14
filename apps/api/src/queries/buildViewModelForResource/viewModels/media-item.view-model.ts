import { IMediaItemViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { BaseViewModel } from './base.view-model';

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

        this.filepath = mediaItem.getFilePath();
    }
}
