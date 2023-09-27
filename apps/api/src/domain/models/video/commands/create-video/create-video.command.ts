import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandBase,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { AggregateId } from '../../../../types/AggregateId';
import { CoscradTimeStamp } from '../../../audio-item/entities/audio-item.entity';
import { VideoCompositeIdentifier } from '../../entities';
import { CREATE_VIDEO } from '../constants';

@Command({
    type: CREATE_VIDEO,
    label: 'Create Video',
    description: 'Create a new video',
})
export class CreateVideo implements ICommandBase {
    @NestedDataType(VideoCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: 'name',
        description: 'the name of the video',
    })
    readonly name: string;

    @LanguageCodeEnum({
        label: 'language for name',
        description:
            'the language the video is named in (not necessarily the language the video is in)',
    })
    readonly languageCodeForName: LanguageCode;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID',
        description: `the ID of the video item's media item`,
    })
    readonly mediaItemId: AggregateId;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: "the length of the audio item's media item in milliseconds",
    })
    readonly lengthMilliseconds: CoscradTimeStamp;
}
