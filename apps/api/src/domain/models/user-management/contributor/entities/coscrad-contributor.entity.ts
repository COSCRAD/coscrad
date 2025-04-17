import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateRoot } from '../../../../../domain/decorators';
import { AggregateCompositeIdentifier } from '../../../../../domain/types/AggregateCompositeIdentifier';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../../test-data/utilities/coscrad-data-example';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { Aggregate } from '../../../aggregate.entity';
import { FullName } from '../../user/entities/user/full-name.entity';
import { CoscradDate } from '../../utilities/coscrad-date.entity';
import { ContributorNotUniquelyIdentifiableUserError } from './errors';

@CoscradDataExample<CoscradContributor>({
    example: {
        id: buildDummyUuid(393),
        type: AggregateType.contributor,
        fullName: new FullName({
            firstName: 'Arrow',
            lastName: 'Plain',
        }),
    },
})
@AggregateRoot(AggregateType.contributor)
@RegisterIndexScopedCommands([])
export class CoscradContributor extends Aggregate {
    readonly type = AggregateType.contributor;

    @NestedDataType(FullName, {
        label: 'full name',
        description: "The Contributor's Full Name",
    })
    readonly fullName: FullName;

    @NestedDataType(CoscradDate, {
        label: 'date of birth',
        description: "Contributor's Date of Birth",
        isOptional: true,
    })
    readonly dateOfBirth?: CoscradDate;

    @NonEmptyString({
        label: 'biography',
        description: 'A Short Biography',
        isOptional: true,
    })
    readonly shortBio?: string;

    constructor(dto: DTO<CoscradContributor>) {
        super(dto);

        if (!dto) return;

        const { fullName: fullNameDto, dateOfBirth: dobDto, shortBio } = dto;

        // Do we validate nested invariants?
        this.fullName = new FullName(fullNameDto);

        // This is an optional property
        if (!isNullOrUndefined(dobDto)) this.dateOfBirth = new CoscradDate(dobDto);

        // This is an optional property
        if (!isNullOrUndefined(shortBio)) {
            this.shortBio = shortBio;
        }
    }

    protected validateComplexInvariants(): InternalError[] {
        if (isNullOrUndefined(this.dateOfBirth) && isNullOrUndefined(this.shortBio)) {
            return [new ContributorNotUniquelyIdentifiableUserError(this.fullName)];
        }

        return this.dateOfBirth?.validateComplexInvariants() || [];
    }

    getAvailableCommands(): string[] {
        return [];
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.fullName.toString(), LanguageCode.English);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    public static fromDto(dto: DTO<CoscradContributor>): CoscradContributor {
        return new CoscradContributor(dto);
    }
}
