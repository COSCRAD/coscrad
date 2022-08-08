import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import categoryValidator from '../../../domainModelValidators/categoryValidator';
import { Valid } from '../../../domainModelValidators/Valid';
import { HasAggregateIdAndLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { Aggregate } from '../../aggregate.entity';
import { CategorizableCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

@RegisterIndexScopedCommands([])
export class Category extends Aggregate implements HasAggregateIdAndLabel {
    readonly type = AggregateType.category;

    readonly id: AggregateId;

    readonly label: string;

    readonly members: CategorizableCompositeIdentifier[];

    // These are `Category` IDs for the children categories of this category
    readonly childrenIDs: AggregateId[];

    constructor(dto: DTO<Category>) {
        super(dto);

        const { id, label, members, childrenIDs } = dto;

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);

        this.childrenIDs = Array.isArray(childrenIDs) ? [...childrenIDs] : undefined;
    }

    getAvailableCommands(): string[] {
        return [];
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return categoryValidator(this);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.members;
    }
}
