import { ICommandBase, ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { AudioVisualCompositeIdentifier } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { CREATE_TRANSCRIPT } from '../constants';

@Command({
    type: CREATE_TRANSCRIPT,
    label: 'Create Transcript',
    description: 'creates a new transcript for an audio item or video',
})
export class CreateTranscript implements ICommandBase {
    @NestedDataType(AudioVisualCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier<
        typeof ResourceType.video | typeof ResourceType.audioItem
    >;
}
