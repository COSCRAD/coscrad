import { AggregateCompositeIdentifier, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { AudioItemCompositeIdentifier } from '../../../entities/audio-item-composite-identifier';
import { ADD_PARTICIPANT_TO_TRANSCRIPT } from '../constants';

@Command({
    type: ADD_PARTICIPANT_TO_TRANSCRIPT,
    description: 'Adds a participant to a transcript',
    label: 'Add Participant to Transcript',
})
export class AddParticipantToTranscript implements ICommandBase {
    @NestedDataType(AudioItemCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: `participant's initials`,
        description: `the initials or identifier to use for this participant`,
    })
    readonly initials: string;

    // Consider making this a `personId`
    @NonEmptyString({
        label: `participant's name`,
        description: `the full name of the participant`,
    })
    readonly name: string;
}