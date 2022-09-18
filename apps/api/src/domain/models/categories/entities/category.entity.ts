import { NonEmptyString } from '@coscrad/data-types';
import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { HasLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { CategorizableType } from '../../../types/CategorizableType';
import { Aggregate } from '../../aggregate.entity';

class CategorizableCompositeIdentifier {
    @IsEnum(CategorizableType)
    type: CategorizableType;

    @NonEmptyString()
    id: AggregateId;
}

@RegisterIndexScopedCommands([])
export class Category extends Aggregate implements HasLabel {
    readonly type = AggregateType.category;

    readonly id: AggregateId;

    @NonEmptyString()
    readonly label: string;

    // TODO abstract this into our data-types lib
    @Type(() => CategorizableCompositeIdentifier)
    @ValidateNested({ each: true })
    readonly members: CategorizableCompositeIdentifier[];

    // These are `Category` IDs for the children categories of this category
    // TODO Make this a UUID
    @NonEmptyString({ isArray: true })
    readonly childrenIDs: AggregateId[];

    constructor(dto: DTO<Category>) {
        super(dto);

        if (!dto) return;

        const { id, label, members, childrenIDs } = dto;

        this.id = id;

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
