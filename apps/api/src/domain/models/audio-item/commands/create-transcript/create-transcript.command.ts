import { AggregateCompositeIdentifier, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { AudioItemCompositeIdentifier } from '../../entities/audio-item-composite-identifier';
import { CREATE_TRANSCRIPT } from './constants';

@Command({
    type: CREATE_TRANSCRIPT,
    // in the future we will support video as well
    description: 'creates a new transcript for an audio item',
})
export class CreateTranscript implements ICommandBase {
    @NestedDataType(AudioItemCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}
