import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { ICreateCommand } from '../../shared/command-handlers/interfaces/create-command.interface';
import { TagCompositeIdentifier } from './tag-composite-identifier';

@Command({ type: 'CREATE_TAG', label: 'Create Tag', description: 'Creates a new tag' })
export class CreateTag implements ICreateCommand {
    @NestedDataType(TagCompositeIdentifier, {
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
