import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../../domain/common';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { CreateTranscript } from './create-transcript.command';

export type TranscriptCreatedPayload = CreateTranscript;

const testEventId = buildDummyUuid(100);
@CoscradDataExample<TranscriptCreated>({
    example: {
        id: testEventId,
        meta: {
            id: testEventId,
            userId: buildDummyUuid(101),
            dateCreated: dummyDateNow,
            contributorIds: [],
        },
        type: 'TRANSCRIPT_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.audioItem,
                id: buildDummyUuid(1),
            },
        },
    },
})
@CoscradEvent('TRANSCRIPT_CREATED')
export class TranscriptCreated extends BaseEvent<TranscriptCreatedPayload> {
    readonly type = 'TRANSCRIPT_CREATED';

    public static fromDto(dto: DTO<TranscriptCreated>) {
        if (!dto) return;

        const { payload, meta } = dto;

        return new TranscriptCreated(payload, meta);
    }
}
