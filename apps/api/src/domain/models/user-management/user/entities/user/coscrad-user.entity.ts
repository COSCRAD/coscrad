import {
    CoscradEnum,
    CoscradUserRole,
    Enum,
    NestedDataType,
    NonEmptyString,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { UpdateMethod } from '../../../../../../domain/decorators';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../common/entities/multilingual-text';
import { Valid, isValid } from '../../../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../../utilities/validation/is-null-or-undefined';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { Aggregate } from '../../../../aggregate.entity';
import InvalidExternalStateError from '../../../../shared/common-command-errors/InvalidExternalStateError';
import UserIdFromAuthProviderAlreadyInUseError from '../../errors/external-state-errors/UserIdFromAuthProviderAlreadyInUseError';
import UsernameAlreadyInUseError from '../../errors/external-state-errors/UsernameAlreadyInUseError';
import UserAlreadyHasRoleError from '../../errors/invalid-state-transition-errors/UserAlreadyHasRoleError';
import { CoscradUserProfile } from './coscrad-user-profile.entity';

const sampleUserId = buildDummyUuid(99);

@CoscradDataExample<CoscradUser>({
    example: {
        type: AggregateType.user,
        id: buildDummyUuid(101),
        authProviderUserId: sampleUserId,
        username: 'test-system-user',
        roles: [],
    },
})
@RegisterIndexScopedCommands(['REGISTER_USER'])
export class CoscradUser extends Aggregate {
    type = AggregateType.user;

    /**
     * We don't use the auth provider ID as the internal user ID for multiple reasons.
     * - We want to be in control of our ID generation and format
     * - Some auth providers use IDs that are not allowed as Arango keys
     *     - This leads to leaky abstractions around the db and auth provider
     * - We may want to use a different or multiple auth providers
     * - We want it to be easy to switch auth providers
     */
    @NonEmptyString({
        label: 'user ID with the auth provider',
        description: 'an external ID that identifies the user with the auth provider',
    })
    readonly authProviderUserId: string;

    @NonEmptyString({
        label: 'username',
        description: 'a human-readable identifier for this user',
    })
    readonly username: string;

    @NestedDataType(CoscradUserProfile, {
        isOptional: true,
        label: 'profile',
        description: "the user's profile information",
    })
    readonly profile?: CoscradUserProfile;

    @Enum(CoscradEnum.CoscradUserRole, {
        isArray: true,
        label: 'roles',
        description:
            "the user's roles, which grant privileges to perform certain read \\ write actions",
    })
    readonly roles: CoscradUserRole[];

    // userData - we may want to store usage data some day- e.g. to store what level the user has completed on a game

    // preferences - we may want to store user-specific preferences some day

    constructor(dto: DTO<CoscradUser>) {
        super(dto);

        if (!dto) return;

        const { profile: profileDto, roles, username, authProviderUserId } = dto;

        // Note that this is necessary for our simple invariant validation to catch required but missing nested properties
        this.profile = !isNullOrUndefined(profileDto)
            ? new CoscradUserProfile(profileDto)
            : undefined;

        this.username = username;

        // Each role is a string, so a shallow clone is effectively deep clone
        this.roles = Array.isArray(roles) ? [...roles] : undefined;

        this.authProviderUserId = authProviderUserId;
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.username);
    }

    isAdmin() {
        return [CoscradUserRole.projectAdmin, CoscradUserRole.superAdmin].some((role) =>
            this.roles.includes(role)
        );
    }

    @UpdateMethod()
    grantRole(role: CoscradUserRole): ResultOrError<CoscradUser> {
        if (this.roles.includes(role)) return new UserAlreadyHasRoleError(this.id, role);

        this.roles.push(role);

        return this;
    }

    getAvailableCommands(): string[] {
        const availableCommands: string[] = [];

        if (this.roles.length < Object.values(CoscradUserRole).length)
            availableCommands.push('GRANT_USER_ROLE');

        return availableCommands;
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/182727483]
     * Add unit test.
     *
     * Note that ideally we would push these constraints to the database. These
     * global uniqueness checks are important. We may want to persist users via
     * state-based snapshots instead of events indefinitely for this reason.
     */
    validateExternalState(externalState: InMemorySnapshot): InternalError | Valid {
        const { user: users } = externalState;

        const allErrors: InternalError[] = [];

        const defaultValidationResult = super.validateExternalState(externalState);

        if (!isValid(defaultValidationResult))
            allErrors.push(...defaultValidationResult.innerErrors);

        if (users.some(({ authProviderUserId }) => authProviderUserId === this.authProviderUserId))
            allErrors.push(new UserIdFromAuthProviderAlreadyInUseError(this.authProviderUserId));

        if (users.some(({ username }) => username === this.username))
            allErrors.push(new UsernameAlreadyInUseError(this.username));

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    // can we make this generic?
    public static fromDto(dto: DTO<CoscradUser>): CoscradUser {
        return new CoscradUser(dto);
    }
}
