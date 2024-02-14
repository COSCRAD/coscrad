import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { RelabelTag } from './relabel-tag.command';

export type TagRelabelledPayload = RelabelTag;

@CoscradEvent('TAG_RELABELLED')
export class TagRelabelled extends BaseEvent<TagRelabelledPayload> {
    readonly type = 'TAG_RELABELLED';
}
