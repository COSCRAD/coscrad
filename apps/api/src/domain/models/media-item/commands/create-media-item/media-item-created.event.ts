import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateMediaItem } from './create-media-item.command';

const MEDIA_ITEM_CREATED = 'MEDIA_ITEM_CREATED';

export type MediaItemCreatedPayload = CreateMediaItem;

@CoscradEvent(MEDIA_ITEM_CREATED)
export class MediaItemCreated extends BaseEvent<MediaItemCreatedPayload> {
    type = MEDIA_ITEM_CREATED;
}
