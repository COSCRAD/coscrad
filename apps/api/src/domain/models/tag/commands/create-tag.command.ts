import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { TagCompositeIdentifier } from './tag-composite-identifier';

@Command({ type: 'CREATE_TAG', label: 'Create Tag', description: 'Creates a new tag' })
export class CreateTag implements ICommandBase {
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
