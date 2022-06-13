import { Command, ICommand } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    URL,
    UUID,
} from '@coscrad/data-types';
import {
    IsNonNegativeFiniteNumber,
    IsOptional,
    IsStringWithNonzeroLength,
    IsUrl,
    IsUUID,
    ValidateNested,
} from '@coscrad/validation';
import { ContributorAndRole } from '../ContributorAndRole';

@Command('ADD_SONG')
export class AddSong implements ICommand {
    @UUID()
    @IsUUID()
    readonly id: string;

    @NonEmptyString({ isOptional: true })
    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly title?: string;

    @NonEmptyString({ isOptional: true })
    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole)
    @ValidateNested()
    readonly contributorAndRoles: ContributorAndRole[];

    @NonEmptyString()
    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly lyrics?: string;

    @URL()
    @IsUrl()
    readonly audioURL: string;

    @NonNegativeFiniteNumber()
    @IsNonNegativeFiniteNumber()
    readonly lengthMilliseconds: number;
}
