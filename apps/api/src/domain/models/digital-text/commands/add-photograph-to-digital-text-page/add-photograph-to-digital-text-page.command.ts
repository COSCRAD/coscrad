import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { PageIdentifier } from '../../entities';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: 'ADD_PHOTOGRAPH_TO_DIGITAL_TEXT_PAGE',
    description: 'Add a photograph to a digital text page',
    label: 'Add Photograph to Page',
})
export class AddPhotographToDigitalTextPage implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @NonEmptyString({
        label: 'page identifier',
        description: 'the page to which you are adding the photograph',
    })
    readonly pageIdentifier: PageIdentifier;

    @ReferenceTo(AggregateType.photograph)
    @UUID({
        label: 'photograph ID',
        description: 'system reference to the photograph',
    })
    readonly photographId: AggregateId;
}
