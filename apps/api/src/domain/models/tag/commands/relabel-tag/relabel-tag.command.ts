import { Command, ICommand } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { TagCompositeIdentifier } from '../tag-composite-identifier';

@Command({
    type: 'RELABEL_TAG',
    label: 'Relabel Tag',
    description: 'changes the label for a tag while maintaining its membership',
})
export class RelabelTag implements ICommand {
    @NestedDataType(TagCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: 'new label',
        description: "the label to replace the tag's old label",
    })
    readonly newLabel: string;
}
