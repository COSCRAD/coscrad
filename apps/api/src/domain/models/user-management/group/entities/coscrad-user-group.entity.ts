import { NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { isValid, Valid } from '../../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { Aggregate } from '../../../aggregate.entity';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import getId from '../../../shared/functional/getId';
import { UserDoesNotExistError } from '../errors/external-state-errors/UserDoesNotExistError';
import { UserGroupLabelAlreadyInUseError } from '../errors/external-state-errors/UserGroupLabelAlreadyInUseError';
import UserIsAlreadyInGroupError from '../errors/invalid-state-transition-errors/UserIsAlreadyInGroupError';

@RegisterIndexScopedCommands(['CREATE_USER_GROUP'])
export class CoscradUserGroup extends Aggregate {
    type = AggregateType.userGroup;

    @NonEmptyString({
        label: 'label',
        description: 'the name of the group',
    })
    readonly label: string; // Consider making this multi-lingual text

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182693980]
     * Make this type `AggregateId`.
     */
    @NonEmptyString({
        isArray: true,
        label: 'user IDs',
        description: 'the ID of every user that is in this group',
    })
    readonly userIds: string[];

    @NonEmptyString({
        label: 'description',
        description:
            'a summary of the significance of this user group (what its members have in common)',
    })
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

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.label);
    }

    getAvailableCommands(): string[] {
        return ['ADD_USER_TO_GROUP'];
    }

    hasUser(userId: AggregateId) {
        return this.userIds.includes(userId);
    }

    addUser(newUserId: AggregateId) {
        if (this.userIds.includes(newUserId)) {
            // Invalid state transition
            return new UserIsAlreadyInGroupError(newUserId, this);
        }

        // ensure new instance does not violate invariants
        return this.safeClone<CoscradUserGroup>({
            // userIds are strings so shallow clone is sufficient to avoid shared references
            userIds: [...this.userIds, newUserId],
        });
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.userIds.map((id) => ({
            type: AggregateType.user,
            id,
        }));
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182727483]
     * Add unit test.
     */
    validateExternalState(externalState: InMemorySnapshot): InternalError | typeof Valid {
        const { user: users, userGroup: existingUserGroups } = externalState;

        const allErrors: InternalError[] = [];

        // TODO We should use a different pattern so that we don't have to explicitly call this
        const inheritedExternalStateValidationResult = super.validateExternalState(externalState);

        if (!isValid(inheritedExternalStateValidationResult))
            allErrors.push(...inheritedExternalStateValidationResult.innerErrors);

        const existingUserIds = users.map(getId);

        const userIdsThatDoNotExist = this.userIds.filter(
            (referencedUserId) => !existingUserIds.includes(referencedUserId)
        );

        if (userIdsThatDoNotExist.length > 0) {
            allErrors.push(...userIdsThatDoNotExist.map((id) => new UserDoesNotExistError(id)));
        }

        if (existingUserGroups.some(({ label }) => label === this.label)) {
            allErrors.push(new UserGroupLabelAlreadyInUseError(this.label));
        }

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }
}
