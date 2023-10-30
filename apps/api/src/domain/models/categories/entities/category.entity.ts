import { CompositeIdentifier, ExternalEnum, NonEmptyString } from '@coscrad/data-types';
import { Type } from 'class-transformer';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import formatAggregateType from '../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { HasLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { CategorizableType, isCategorizableType } from '../../../types/CategorizableType';
import { Aggregate } from '../../aggregate.entity';

class CategorizableCompositeIdentifier {
    @ExternalEnum(
        {
            enumName: 'CategorizableType',
            enumLabel: 'Resource Type or Note',
            labelsAndValues: Object.values(CategorizableType).map((ct) => ({
                label: formatAggregateType(ct),
                value: ct,
            })),
        },
        {
            label: 'Resource Type or Note',
            description: 'Specifies whether this is a note or a specific kind of resource',
        }
    )
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

    getName(): MultilingualText {
        // Do we need multiling labels? Configurable language for the labels?
        return buildMultilingualTextWithSingleItem(this.label);
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
