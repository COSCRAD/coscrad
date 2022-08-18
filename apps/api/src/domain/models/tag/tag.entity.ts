import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { HasAggregateIdAndLabel } from '../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { Aggregate } from '../aggregate.entity';
import { CategorizableCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';

@RegisterIndexScopedCommands([])
export class Tag extends Aggregate implements HasAggregateIdAndLabel {
    type = AggregateType.tag;

    id: AggregateId;

    label: string;

    members: CategorizableCompositeIdentifier[];

    constructor(dto: DTO<Tag>) {
        super(dto);

        if (!dto) return;

        const { id, label, members } = dto;

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
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
