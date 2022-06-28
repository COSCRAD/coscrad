import { Command } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    RawDataObject,
    URL,
    UUID,
} from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { ICreateCommand } from '../../shared/command-handlers/interfaces/create-command.interface';
import { ContributorAndRole } from '../ContributorAndRole';

@Command({
    type: 'CREATE_SONG',
    label: 'Create Song',
    description: 'Creates a new song',
})
export class CreateSong implements ICreateCommand {
    @UUID()
    readonly id: AggregateId;

    @NonEmptyString({ isOptional: true })
    readonly title?: string;

    @NonEmptyString({ isOptional: true })
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole, { isArray: true })
    readonly contributorAndRoles: ContributorAndRole[];

    @NonEmptyString({ isOptional: true })
    readonly lyrics?: string;

    @URL()
    readonly audioURL: string;

    @NonNegativeFiniteNumber()
    readonly lengthMilliseconds: number;

    @RawDataObject({ isOptional: true })
    readonly rawData?: Record<string, unknown>;
}
