import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ImportPagesToDigitalText } from './import-pages-to-digital-text.command';

export type PagesImportedToDigitalTextPayload = ImportPagesToDigitalText;

@CoscradEvent('PAGES_IMPORTED_TO_DIGITAL_TEXT')
export class PagesImportedToDigitalText extends BaseEvent<PagesImportedToDigitalTextPayload> {
    readonly type = 'PAGES_IMPORTED_TO_DIGITAL_TEXT';
}
