import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateNote } from './translate-note.command';

export type NoteTranslatedPayload = TranslateNote;

@CoscradEvent('NOTE_TRANSLATED')
export class NoteTranslated extends BaseEvent<NoteTranslatedPayload> {
    readonly type = 'NOTE_TRANSLATED';
}
