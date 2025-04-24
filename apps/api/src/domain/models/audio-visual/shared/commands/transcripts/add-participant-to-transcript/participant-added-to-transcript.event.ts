import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../../domain/common';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';

export type ParticipantAddedToTranscriptPayload = AddParticipantToTranscript;

const sampleEventId = buildDummyUuid(1);

@CoscradDataExample<ParticipantAddedToTranscript>({
    example: {
        type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
        id: sampleEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.audioItem,
                id: buildDummyUuid(5),
            },
            initials: 'AP',
            name: 'Andy Paul',
        },
        meta: {
            id: sampleEventId,
            userId: buildDummyUuid(3),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent(`PARTICIPANT_ADDED_TO_TRANSCRIPT`)
export class ParticipantAddedToTranscript extends BaseEvent<ParticipantAddedToTranscriptPayload> {
    readonly type = `PARTICIPANT_ADDED_TO_TRANSCRIPT`;

    public static fromDto(dto: DTO<ParticipantAddedToTranscript>) {
        if (!dto) return;

        const { meta, payload } = dto;

        return new ParticipantAddedToTranscript(payload, meta);
    }
}
