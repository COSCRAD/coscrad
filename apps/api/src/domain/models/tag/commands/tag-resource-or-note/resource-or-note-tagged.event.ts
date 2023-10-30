import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TagResourceOrNote } from './tag-resource-or-note.command';

const eventType = 'RESOURCE_OR_NOTE_TAGGED';

export type ResourceOrNoteTaggedPayload = TagResourceOrNote;

@CoscradEvent(eventType)
export class ResourceOrNoteTagged extends BaseEvent<ResourceOrNoteTaggedPayload> {
    type = eventType;
}
