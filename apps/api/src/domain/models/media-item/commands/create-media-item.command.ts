import { Command } from '@coscrad/commands';
import {
    CoscradEnum,
    Enum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    RawDataObject,
    URL,
    UUID,
} from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';
import { ICreateCommand } from '../../shared/command-handlers/interfaces/create-command.interface';
import { ContributorAndRole } from '../../song/ContributorAndRole';

@Command({
    type: 'CREATE_MEDIA_ITEM',
    label: 'Create Media Item',
    description: 'Creates a new media item',
})
export class CreateMediaItem implements ICreateCommand {
    @UUID({
        label: 'media item ID (generated)',
        description: 'a unique identifier for this media item',
    })
    readonly id: AggregateId;

    @NonEmptyString({
        isOptional: true,
        label: 'title (language)',
        description: 'title of the media item in the language',
    })
    readonly title?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'title (colonial language)',
        description: 'title of the media item in the colonial language',
    })
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole, {
        isArray: true,
        label: 'contributions',
        description:
            'an acknowledgement of each person who contributed to creating and producing this song',
    })
    readonly contributions: ContributorAndRole[];

    @URL({
        label: 'audio link',
        description: 'a web URL link to a digital version of this media item for playback',
    })
    readonly url: string;

    @Enum(CoscradEnum.MIMEType, {
        label: 'MIME type',
        description: 'technical specification of the type of this media item',
    })
    readonly mimeType: MIMEType;

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description: 'raw data from a third-party system for posterity',
    })
    readonly rawData?: Record<string, unknown>;

    // The length will be registered later
}
