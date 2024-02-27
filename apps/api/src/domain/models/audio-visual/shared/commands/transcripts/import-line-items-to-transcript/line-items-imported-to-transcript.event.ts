import { CoscradEvent } from '../../../../../../../domain/common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';

export type LineItemsImportedToTranscriptPayload = ImportLineItemsToTranscript;

@CoscradEvent('LINE_ITEMS_IMPORTED_TO_TRANSCRIPT')
export class LineItemsImportedToTranscript extends BaseEvent<LineItemsImportedToTranscriptPayload> {
    readonly type = 'LINE_ITEMS_IMPORTED_TO_TRANSCRIPT';
}
