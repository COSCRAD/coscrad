import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateDigitalTextTitle } from './translate-digital-text-title.command';

export type DigitalTextTitleTranslatedPayload = TranslateDigitalTextTitle;

@CoscradEvent('DIGITAL_TEXT_TITLE_TRANSLATED')
export class DigitalTextTitleTranslated extends BaseEvent<DigitalTextTitleTranslatedPayload> {
    type = 'DIGITAL_TEXT_TITLE_TRANSLATED';
}
