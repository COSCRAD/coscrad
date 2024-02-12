import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddCoverPhotographForDigitalText } from './add-cover-photograph-for-digital-text.command';

export type CoverPhotographAddedForDigitalTextPayload = AddCoverPhotographForDigitalText;

@CoscradEvent('COVER_PHOTOGRAPH_ADDED_FOR_DIGITAL_TEXT')
export class CoverPhotographAddedForDigitalText extends BaseEvent<CoverPhotographAddedForDigitalTextPayload> {
    readonly type = 'COVER_PHOTOGRAPH_ADDED_FOR_DIGITAL_TEXT';
}
