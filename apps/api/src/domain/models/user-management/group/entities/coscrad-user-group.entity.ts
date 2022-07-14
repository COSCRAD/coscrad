import { NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { InvariantValidationMethod } from '../../../../../lib/web-of-knowledge/decorators/invariant-validation-method.decorator';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import InvalidCoscradUserGroupDTOError from '../../../../domainModelValidators/errors/InvalidCoscradUserGroupDTOError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { ValidatesExternalState } from '../../../../interfaces/ValidatesExternalState';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { Aggregate } from '../../../aggregate.entity';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import getId from '../../../shared/functional/getId';
import idEquals from '../../../shared/functional/idEquals';
import { UserDoesNotExistError } from '../errors/external-state-errors/UserDoesNotExistError';
import { UserGroupIdAlreadyInUseError } from '../errors/external-state-errors/UserGroupIdAlreadyInUseError';
import { UserGroupLabelAlreadyInUseError } from '../errors/external-state-errors/UserGroupLabelAlreadyInUseError';

@RegisterIndexScopedCommands(['CREATE_GROUP'])
export class CoscradUserGroup extends Aggregate implements ValidatesExternalState {
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

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182727483]
     * Add unit test.
     */
    validateExternalState({
        users,
        userGroups: existingUserGroups,
    }: InMemorySnapshot): InternalError | typeof Valid {
        const allErrors: InternalError[] = [];
        const existingUserIds = users.map(getId);

        const userIdsThatDoNotExist = this.userIds.filter(
            (referencedUserId) => !existingUserIds.includes(referencedUserId)
        );

        if (userIdsThatDoNotExist.length > 0) {
            allErrors.push(...userIdsThatDoNotExist.map((id) => new UserDoesNotExistError(id)));
        }

        if (existingUserGroups.some(idEquals(this.id))) {
            allErrors.push(new UserGroupIdAlreadyInUseError(this.id));
        }

        if (existingUserGroups.some(({ label }) => label === this.label)) {
            allErrors.push(new UserGroupLabelAlreadyInUseError(this.label));
        }

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }
}
