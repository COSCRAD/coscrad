import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';

export class TranscriptParticipant extends BaseDomainModel {
    @NonEmptyString({
        label: 'speaker initials',
        description: 'the initials or text identifier for this speaker',
    })
    readonly initials: string;

    @NonEmptyString({
        label: 'name',
        description: "the participant's name",
    })
    // This should eventually refer to a "Person" model by ID
    // For now we'll simply put the Participant's name here
    readonly name: AggregateId;

    constructor({ initials: label, name: id }: DTO<TranscriptParticipant>) {
        super();

        this.initials = label;

        this.name = id;
    }
}
