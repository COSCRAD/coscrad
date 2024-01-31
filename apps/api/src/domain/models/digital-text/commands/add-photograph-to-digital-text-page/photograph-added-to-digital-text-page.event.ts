import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddPhotographToDigitalTextPage } from './add-photograph-to-digital-text-page.command';

export type PhotographAddedToDigitalTextPagePayload = AddPhotographToDigitalTextPage;

@CoscradEvent('PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE')
export class PhotographAddedToDigitalTextPage extends BaseEvent<PhotographAddedToDigitalTextPagePayload> {
    readonly type = 'PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE';
}
