import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateTag } from './create-tag.command';

export type TagCreatedPayload = CreateTag;

@CoscradEvent('TAG_CREATED')
export class TagCreated extends BaseEvent<TagCreatedPayload> {
    type = 'TAG_CREATED';
}
