import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../../domain/common';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';

export type LineItemsImportedToTranscriptPayload = ImportLineItemsToTranscript;

const eventId = buildDummyUuid(2);

@CoscradDataExample<LineItemsImportedToTranscript>({
    example: {
        type: 'LINE_ITEMS_IMPORTED_TO_TRANSCRIPT',
        id: eventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.audioItem,
                id: buildDummyUuid(91),
            },
            lineItems: [],
        },
        meta: {
            id: eventId,
            userId: buildDummyUuid(9),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('LINE_ITEMS_IMPORTED_TO_TRANSCRIPT')
export class LineItemsImportedToTranscript extends BaseEvent<LineItemsImportedToTranscriptPayload> {
    readonly type = 'LINE_ITEMS_IMPORTED_TO_TRANSCRIPT';

    public static fromDto(dto: DTO<LineItemsImportedToTranscript>) {
        const { payload, meta } = dto;

        return new LineItemsImportedToTranscript(payload, meta);
    }
}
