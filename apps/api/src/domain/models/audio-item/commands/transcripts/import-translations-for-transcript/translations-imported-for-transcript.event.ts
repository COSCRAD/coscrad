import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class TranslationsImportedForTranscript extends BaseEvent {
    readonly type = `TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT`;
}
