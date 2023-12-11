import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateDigitalTextPageContent } from './translate-digital-text-page-content.command';

export type DigitalTextPageContentTranslatedPayload = TranslateDigitalTextPageContent;

@CoscradEvent(`DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`)
export class DigitalTextPageContentTranslated extends BaseEvent<DigitalTextPageContentTranslatedPayload> {
    readonly type = `DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`;
}
