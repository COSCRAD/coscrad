import { NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { InvariantValidationMethod } from '../../../../../lib/web-of-knowledge/decorators/invariant-validation-method.decorator';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import InvalidCoscradUserGroupDTOError from '../../../../domainModelValidators/errors/InvalidCoscradUserGroupDTOError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { Aggregate } from '../../../aggregate.entity';
import validateCoscradUserGroup from './invariant-validation/validateCoscradUserGroup';

@RegisterIndexScopedCommands([])
export class CoscradUserGroup extends Aggregate {
    type = AggregateType.userGroup;

    @NonEmptyString()
    readonly label: string; // Consider making this multi-lingual text

    @NonEmptyString({ isArray: true })
    readonly userIds: AggregateId[];

    @NonEmptyString()
    readonly description: string;

    constructor(dto: DTO<CoscradUserGroup>) {
        super(dto);

        if (!dto) return;

        const { label, userIds, description } = dto;

        this.label = label;

        // IDs are string, so a shallow-clone is sufficient to avoid side-effects
        this.userIds = Array.isArray(userIds) ? [...userIds] : undefined;

        this.description = description;
    }

    getAvailableCommands(): string[] {
        return [];
    }

    @InvariantValidationMethod(
        (allErrors: InternalError[], instance: CoscradUserGroup) =>
            new InvalidCoscradUserGroupDTOError(allErrors, instance.id)
    )
    validateInvariants(): ResultOrError<Valid> {
        return validateCoscradUserGroup(this);
    }
}
