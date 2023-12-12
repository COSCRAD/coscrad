import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    ExternalEnum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    RawDataObject,
    URL,
    UUID,
} from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateTypeProperty } from '../../shared/common-commands';

class MediaItemCompositeId {
    @AggregateTypeProperty([AggregateType.mediaItem])
    type = AggregateType.mediaItem;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: 'CREATE_MEDIA_ITEM',
    label: 'Create Media Item',
    description: 'Creates a new media item',
})
export class CreateMediaItem implements ICommandBase {
    /**
     * TODO
     * We need a migration for this schema change. The migration will
     * remove `id`
     * add `aggregateId` = `id` => ({id, type: AggregateType.mediaItem})
     *
     * Before merging this in, we need to get a 'snapshot' of the previous
     * schema (system-wide), which will become v1. We want to persist the history
     * of such changes for posterity.
     */
    // @UUID({
    //     label: 'media item ID (generated)',
    //     description: 'a unique identifier for this media item',
    // })
    // readonly id: AggregateId;

    @NestedDataType(MediaItemCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.mediaItem
    >;

    @NonEmptyString({
        isOptional: true,
        label: 'title (language)',
        description: 'title of the media item in the language',
    })
    readonly title?: string;

    // TODO Remove this
    @NonEmptyString({
        isOptional: true,
        label: 'title (colonial language)',
        description: 'title of the media item in the colonial language',
    })
    readonly titleEnglish?: string;

    /**
     * TODO This property is being removed in favor of edge connections to a
     * separate `Contributor` resource.  For now, we use a config to map in
     * media credits. Be sure to remove this property from existing data. It can
     * simply be ignored in sourcing V1 events.
     */
    // @NestedDataType(ContributorAndRole, {
    //     isArray: true,
    //     label: 'contributions',
    //     description: 'acknowledgement of all contributors who worked on this song',
    // })
    //
    // readonly contributions: ContributorAndRole[];
    // @NestedDataType(ContributorAndRole, {
    //     isArray: true,
    //     label: 'contributions',
    //     description:
    //         'an acknowledgement of each person who contributed to creating and producing this song',
    // })
    // readonly contributions: ContributorAndRole[];

    @URL({
        label: 'audio link',
        description: 'a web URL link to a digital version of this media item for playback',
    })
    readonly url: string;

    // @Enum(CoscradEnum.MIMEType, {
    //     label: 'MIME type',
    //     description: 'technical specification of the type of this media item',
    // })
    @ExternalEnum(
        {
            enumName: `MIMEType`,
            enumLabel: `MIME Type`,
            labelsAndValues: Object.entries(MIMEType).map(([label, value]) => ({
                label,
                value,
            })),
        },
        {
            description: `technical specification of the type of media item`,
            label: `MIME Type`,
        }
    )
    readonly mimeType: MIMEType;

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description: 'raw data from a third-party system for posterity',
    })
    readonly rawData?: Record<string, unknown>;

    // The length will be registered later
}
