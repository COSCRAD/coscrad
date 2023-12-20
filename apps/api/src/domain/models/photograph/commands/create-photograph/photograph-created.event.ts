import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreatePhotograph } from './create-photograph.command';

export type PhotographCreatedPayload = CreatePhotograph;

@CoscradEvent(`PHOTOGRAPH_CREATED`)
export class PhotographCreated extends BaseEvent<PhotographCreatedPayload> {
    type = `PHOTOGRAPH_CREATED`;
}
