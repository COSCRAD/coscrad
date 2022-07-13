import { NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { InvariantValidationMethod } from '../../../../../lib/web-of-knowledge/decorators/invariant-validation-method.decorator';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import InvalidCoscradUserGroupDTOError from '../../../../domainModelValidators/errors/InvalidCoscradUserGroupDTOError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import { Aggregate } from '../../../aggregate.entity';

@RegisterIndexScopedCommands([])
export class CoscradUserGroup extends Aggregate {
    type = AggregateType.userGroup;

    @NonEmptyString()
    readonly label: string; // Consider making this multi-lingual text

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182693980]
     * Make this type `AggregateId`.
     */
    @NonEmptyString({ isArray: true })
    readonly userIds: string[];

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
        // There are no complex invariant rules for a `CoscradUserGroup`
        return Valid;
    }
}
