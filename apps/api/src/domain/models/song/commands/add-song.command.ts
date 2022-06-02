import { Command, ICommand } from '@coscrad/commands';
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
    @IsUUID()
    readonly id: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly title?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly titleEnglish?: string;

    @ValidateNested()
    readonly contributorAndRoles: ContributorAndRole[];

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly lyrics?: string;

    @IsUrl()
    readonly audioURL: string;

    @IsNonNegativeFiniteNumber()
    readonly lengthMilliseconds: number;
}
