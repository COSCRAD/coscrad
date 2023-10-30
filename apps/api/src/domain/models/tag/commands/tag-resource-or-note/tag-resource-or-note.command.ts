import {
    AggregateCompositeIdentifier,
    CategorizableType,
    ICommandBase,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { ExternalEnum, NestedDataType, UUID } from '@coscrad/data-types';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { AggregateId } from '../../../../types/AggregateId';
import { TagCompositeIdentifier } from '../tag-composite-identifier';

class CategorizableCompositeIdentifier {
    @ExternalEnum(
        {
            enumName: 'Categorizable Type',
            enumLabel: 'type',
            labelsAndValues: Object.values(CategorizableType).map((categorizableType) => ({
                label: formatAggregateType(categorizableType),
                value: categorizableType,
            })),
        },
        {
            label: 'type',
            description: 'Either "note" or the resource type',
        }
    )
    type: CategorizableType;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: AggregateId;
}

@Command({
    type: 'TAG_RESOURCE_OR_NOTE',
    label: 'Tag Resource or Note',
    description: 'Assign a tag to a resource or note',
})
export class TagResourceOrNote implements ICommandBase {
    @NestedDataType(TagCompositeIdentifier, {
        label: "Tag's Composite Identifier",
        description: 'system-wide unique identifier for the tag',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NestedDataType(CategorizableCompositeIdentifier, {
        label: "Tagged Member's Composite Identifier",
        description: 'system-wide unique identifier for the resource or note being tagged',
    })
    readonly taggedMemberCompositeIdentifier: CategorizableCompositeIdentifier;
}
