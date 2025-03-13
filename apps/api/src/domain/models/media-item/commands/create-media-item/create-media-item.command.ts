import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    ExternalEnum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    RawDataObject,
    UUID,
} from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { AggregateTypeProperty } from '../../../shared/common-commands';

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

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: 'the length of the media item in milliseconds (audio or video only)',
        isOptional: true,
    })
    // this only is specified when the MIMEType is for an `Audio Item` or `Video`.
    readonly lengthMilliseconds?: number;

    @NonNegativeFiniteNumber({
        label: 'height (px)',
        description: 'the height of the media item in pixels',
        isOptional: true,
    })
    // this only is specified with the MIMEType is for a `Photograph`
    // TODO[https://www.pivotaltracker.com/story/show/186725983 support video
    readonly heightPx?: number;

    @NonNegativeFiniteNumber({
        label: 'width (px)',
        description: 'the width of the media item in pixels',
        isOptional: true,
    })
    // this only is specified with the MIMEType is for a `Photograph`
    // TODO[https://www.pivotaltracker.com/story/show/186725983 support video
    readonly widthPx?: number;
}
