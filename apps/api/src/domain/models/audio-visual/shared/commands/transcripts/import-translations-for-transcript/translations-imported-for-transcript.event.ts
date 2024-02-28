import { CoscradEvent } from '../../../../../../../domain/common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { ImportTranslationsForTranscript } from './import-translations-for-transcript.command';

export type TranslationsImportedForTranscriptPayload = ImportTranslationsForTranscript;

@CoscradEvent('TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT')
export class TranslationsImportedForTranscript extends BaseEvent<TranslationsImportedForTranscriptPayload> {
    readonly type = 'TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT';
}
