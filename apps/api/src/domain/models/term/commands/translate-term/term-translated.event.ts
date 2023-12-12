import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_TRANSLATED } from './constants';
import { TranslateTerm } from './translate-term.command';

export type TermTranslatedPayload = TranslateTerm;

@CoscradEvent(TERM_TRANSLATED)
export class TermTranslated extends BaseEvent<TermTranslatedPayload> {
    type = TERM_TRANSLATED;
}
