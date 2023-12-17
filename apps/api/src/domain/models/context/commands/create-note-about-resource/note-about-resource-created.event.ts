import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateNoteAboutResource } from './create-note-about-resource.command';

export type NoteAboutResourceCreatedPayload = CreateNoteAboutResource;

@CoscradEvent('NOTE_ABOUT_RESOURCE_CREATED')
export class NoteAboutResourceCreated extends BaseEvent<NoteAboutResourceCreatedPayload> {
    type = 'NOTE_ABOUT_RESOURCE_CREATED';
}
