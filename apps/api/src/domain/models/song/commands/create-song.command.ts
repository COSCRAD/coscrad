import { Command, CommandMetadataBase, ICommand } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    URL,
    UUID,
} from '@coscrad/data-types';
import { ContributorAndRole } from '../ContributorAndRole';

@Command<CommandMetadataBase & { label: string; description: string }>({
    type: 'CREATE_SONG',
    label: 'Create Song',
    description: 'Creates a new song',
})
export class CreateSong implements ICommand {
    @UUID()
    readonly id: string;

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
}
