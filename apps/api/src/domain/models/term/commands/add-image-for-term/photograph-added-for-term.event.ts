import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { AddImageForTerm } from './add-image-for-term.command';

export type PhotographAddedForTermPayload = AddImageForTerm;

@CoscradEvent(`PHOTOGRAPH_ADDED_FOR_TERM`)
export class PhotographAddedForTerm extends BaseEvent<PhotographAddedForTermPayload> {
    readonly type = 'PHOTOGRAPH_ADDED_FOR_TERM';
}
