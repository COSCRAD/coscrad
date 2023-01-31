import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { TranscriptItem } from './MediaTimeRange';
import { TranscriptParticipant } from './transcript-participant';

export class Transcript<T extends string = string> extends BaseDomainModel {
    // TODO Validate that there are not duplicate IDs here
    @NestedDataType(TranscriptParticipant, {
        isArray: true,
        label: 'participants',
        description: 'a list of participants and their initials',
    })
    participants: TranscriptParticipant[];

    @NestedDataType(TranscriptItem, {
        isArray: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
    // TODO rename this, as it includes the data as well
    items: TranscriptItem<T>[];

    // Should we configure allowed languages at the top level?

    constructor(dto: DTO<Transcript>) {
        super();

        if (!dto) return;

        const { items, participants } = dto;

        this.participants = Array.isArray(participants)
            ? participants.map((p) => new TranscriptParticipant(p))
            : null;

        this.items = Array.isArray(items) ? items.map((item) => new TranscriptItem(item)) : null;
    }
}
