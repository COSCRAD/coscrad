import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: 'ADD_COVER_PHOTOGRAPH_FOR_DIGITAL_TEXT',
    description: 'Add a cover photograph for digital text',
    label: 'Add Cover Photograph for Digital Text',
})
export class AddCoverPhotographForDigitalText implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unqiue identifier',
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @ReferenceTo(AggregateType.photograph)
    @UUID({
        label: 'photograph ID',
        description: 'system reference to the photograph',
    })
    readonly photographId: AggregateId;
}
