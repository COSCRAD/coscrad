import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { TermCompositeIdentifier } from '../create-term';

@Command({
    type: 'ADD_AUDIO_FOR_TERM',
    label: 'add audio for term',
    description: 'add audio for an existing term',
})
export class AddAudioForTerm implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'term composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: TermCompositeIdentifier;

    @UUID({
        label: 'audio item ID',
        description: 'reference to an audio item',
    })
    readonly audioItemId: AggregateId;
}
