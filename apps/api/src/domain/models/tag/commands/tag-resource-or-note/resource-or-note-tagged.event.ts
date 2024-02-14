import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TagResourceOrNote } from './tag-resource-or-note.command';

export type ResourceOrNoteTaggedPayload = TagResourceOrNote;

@CoscradEvent('RESOURCE_OR_NOTE_TAGGED')
export class ResourceOrNoteTagged extends BaseEvent<ResourceOrNoteTaggedPayload> {
    readonly type = 'RESOURCE_OR_NOTE_TAGGED';
}
