import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, URL, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { ICreateCommand } from '../../shared/command-handlers/interfaces/create-command.interface';
import { ContributorAndRole } from '../ContributorAndRole';

@Command({
    type: 'CREATE_SONG',
    label: 'Create Song',
    description: 'Creates a new song',
})
export class CreateSong implements ICreateCommand {
    @UUID({
        label: 'ID (generated)',
        description: 'unique identifier for the song that will be created',
    })
    readonly id: AggregateId;

    @NonEmptyString({
        isOptional: true,
        label: 'title',
        description: "song's title in the language",
    })
    readonly title?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'title (colonial language)',
        description: "song's title in the colonial language",
    })
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole, {
        isArray: true,
        label: 'contributions',
        description: 'acknowledgement of all contributors who worked on this song',
    })
    readonly contributions: ContributorAndRole[];

    @NonEmptyString({
        isOptional: true,
        label: 'lyrics',
        description: "plain text representation of this song's lyrics",
    })
    readonly lyrics?: string;

    @URL({
        label: 'audio link',
        description: 'a web URL link to the audio for this song',
    })
    readonly audioURL: string;

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description: 'additional data from a legacy \\ third-party system source of the data',
    })
    readonly rawData?: Record<string, unknown>;

    // the length can be set later
}
