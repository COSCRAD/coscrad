import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_CREATED } from './constants';
import { CreateTerm } from './create-term.command';

export type TermCreatedPayload = CreateTerm;

@CoscradEvent(TERM_CREATED)
export class TermCreated extends BaseEvent<TermCreatedPayload> {
    readonly type = 'TERM_CREATED';
}
