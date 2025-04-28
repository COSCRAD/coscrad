import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../../domain/common';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';

export type LineItemAddedToTranscriptPayload = AddLineItemToTranscript;

const eventId = buildDummyUuid(1);

@CoscradDataExample<LineItemAddedToTranscript>({
    example: {
        type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
        id: eventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.audioItem,
                id: buildDummyUuid(99),
            },
            inPointMilliseconds: 100,
            outPointMilliseconds: 200,
            speakerInitials: 'AP',
            text: 'Hello World',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: eventId,
            userId: buildDummyUuid(8),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('LINE_ITEM_ADDED_TO_TRANSCRIPT')
export class LineItemAddedToTranscript extends BaseEvent<LineItemAddedToTranscriptPayload> {
    readonly type = 'LINE_ITEM_ADDED_TO_TRANSCRIPT';

    public static fromDto(dto: DTO<LineItemAddedToTranscript>) {
        const { payload, meta } = dto;

        return new LineItemAddedToTranscript(payload, meta);
    }
}
