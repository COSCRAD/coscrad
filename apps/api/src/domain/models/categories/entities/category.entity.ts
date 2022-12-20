import { CompositeIdentifier, NonEmptyString } from '@coscrad/data-types';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { HasLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { CategorizableType, isCategorizableType } from '../../../types/CategorizableType';
import { Aggregate } from '../../aggregate.entity';

class CategorizableCompositeIdentifier {
    @IsEnum(CategorizableType)
    type: CategorizableType;

    @NonEmptyString({
        label: 'ID',
        description: 'unique identifier for this category',
    })
    id: AggregateId;
}

@RegisterIndexScopedCommands([])
export class Category extends Aggregate implements HasLabel {
    readonly type = AggregateType.category;

    @NonEmptyString({
        label: 'label',
        description: 'the user-facing label for this category',
    })
    readonly label: string;

    @Type(() => CategorizableCompositeIdentifier)
    @CompositeIdentifier(CategorizableType, isCategorizableType, {
        isArray: true,
        label: 'members',
        description: 'the composite identifier of every resource or note in this category',
    })
    readonly members: CategorizableCompositeIdentifier[];

    // These are `Category` IDs for the children categories of this category
    // TODO Make this a UUID
    @NonEmptyString({
        isArray: true,
        label: 'children IDs',
        description: 'the ID of every category that is a child (sub-cateogry) of this one',
    })
    readonly childrenIDs: AggregateId[];

    constructor(dto: DTO<Category>) {
        super(dto);

        if (!dto) return;

        const { label, members, childrenIDs } = dto;

        this.label = label;

        this.members = cloneToPlainObject(members);

        this.childrenIDs = Array.isArray(childrenIDs) ? [...childrenIDs] : undefined;
    }

    getAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.members;
    }
}
