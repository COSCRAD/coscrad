import { NonEmptyString } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../base-domain-model.entity';

@CoscradDataExample<TranscriptParticipant>({
    example: {
        initials: 'BS',
        name: 'Bob Smith',
    },
})
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
    readonly name: string;

    constructor({ initials: label, name: id }: DTO<TranscriptParticipant>) {
        super();

        this.initials = label;

        this.name = id;
    }

    public static fromDto(dto: DTO<TranscriptParticipant>) {
        return new TranscriptParticipant(dto);
    }
}
