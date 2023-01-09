import {
    AggregateCompositeIdentifier,
    CategorizableType,
    ICommandBase,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { IsEnum } from '@coscrad/validation';
import { AggregateId } from '../../../../types/AggregateId';
import { TagCompositeIdentifier } from '../tag-composite-identifier';

class CategorizableCompositeIdentifier {
    @IsEnum(CategorizableType)
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
