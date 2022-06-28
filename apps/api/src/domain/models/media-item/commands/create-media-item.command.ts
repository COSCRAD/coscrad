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
    @UUID()
    readonly id: AggregateId;

    @NonEmptyString({ isOptional: true })
    readonly title?: string;

    @NonEmptyString({ isOptional: true })
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole, { isArray: true })
    readonly contributions: ContributorAndRole[];

    @URL()
    readonly url: string;

    @Enum(CoscradEnum.MIMEType)
    readonly mimeType: MIMEType;

    @RawDataObject({ isOptional: true })
    readonly rawData?: Record<string, unknown>;

    // The length will be registered later
}
