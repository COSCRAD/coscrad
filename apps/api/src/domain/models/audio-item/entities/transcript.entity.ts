import { NestedDataType } from '@coscrad/data-types';
import { DeepPartial } from '../../../../types/DeepPartial';
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

    /**
     * TODO Every entity (even nested entities that are not the aggregate root)
     * should be able to validate its own invariants. This would allow us
     * to call `safeClone` on any `DomainModel`.
     *
     * For now, "simple invariants" (i.e. generalized type rules) are
     * checked in the domain model factories. But complex invariant validation
     * must be done on the aggregate root (`AudioItem` in this case).
     */
    addParticipant(participant: TranscriptParticipant) {
        // TODO validate that name and initials are unique
        //    const { name, initials} = participant;

        return this.clone({
            // avoid shared references by cloning
            participants: this.participants.concat(participant.clone()),
        } as DeepPartial<DTO<this>>);
    }
}
