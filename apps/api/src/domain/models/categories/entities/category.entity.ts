import { CompositeIdentifier, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { HasAggregateIdAndLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { CategorizableType, isCategorizableType } from '../../../types/CategorizableType';
import { Aggregate } from '../../aggregate.entity';
import { CategorizableCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

@RegisterIndexScopedCommands([])
export class Category extends Aggregate implements HasAggregateIdAndLabel {
    readonly type = AggregateType.category;

    readonly id: AggregateId;

    @NonEmptyString()
    readonly label: string;

    @CompositeIdentifier(CategorizableType, isCategorizableType, { isArray: true })
    readonly members: CategorizableCompositeIdentifier[];

    // These are `Category` IDs for the children categories of this category
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
