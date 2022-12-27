import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { Equals } from 'class-validator';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { ICreateCommand } from '../../shared/command-handlers/interfaces/create-command.interface';

class TagCompositeId {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.tag)
    type = AggregateType.tag;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({ type: 'CREATE_TAG', label: 'Create Tag', description: 'Creates a new tag' })
export class CreateTag implements ICreateCommand {
    @NestedDataType(TagCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<typeof AggregateType.tag>;

    @NonEmptyString({
        label: 'label',
        description: "the tag's name",
    })
    label: string;
}
