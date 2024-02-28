import { CoscradEvent } from '../../../../../../../domain/common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';

export type LineItemAddedToTranscriptPayload = AddLineItemToTranscript;

@CoscradEvent('LINE_ITEM_ADDED_TO_TRANSCRIPT')
export class LineItemAddedToTranscript extends BaseEvent<LineItemAddedToTranscriptPayload> {
    readonly type = 'LINE_ITEM_ADDED_TO_TRANSCRIPT';
}
