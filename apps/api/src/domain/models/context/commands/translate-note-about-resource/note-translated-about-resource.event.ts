import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateNoteAboutResource } from './translate-note-about-resource.command';

export type NoteTranslatedAboutResourcePayload = TranslateNoteAboutResource;

@CoscradEvent('NOTE_TRANSLATED_ABOUT_RESOURCE')
export class NoteTranslatedAboutResource extends BaseEvent {
    readonly type = 'NOTE_TRANSLATED_ABOUT_RESOURCE';
}
