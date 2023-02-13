import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonNegativeFiniteNumber, ReferenceTo, UUID } from '@coscrad/data-types';
import { MultiLingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';
import { AudioItemCompositeIdentifier } from '../../entities/audio-item-composite-identifier';
import { CoscradTimeStamp } from '../../entities/audio-item.entity';
import { CREATE_AUDIO_ITEM } from '../constants';

@Command({
    type: CREATE_AUDIO_ITEM,
    label: 'Create Audio Item',
    description: 'Create a new audio item',
})
export class CreateAudioItem implements ICommandBase {
    // This must be generated via our ID system and appended to the payload
    @NestedDataType(AudioItemCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NestedDataType(MultiLingualText, {
        label: 'name',
        description: 'the name of the transcript',
    })
    readonly name: MultiLingualText;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID',
        description: `the ID of the transcript's media item`,
    })
    readonly mediaItemId: AggregateId;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: "the length of the transcript's media item in milliseconds",
    })
    readonly lengthMilliseconds: CoscradTimeStamp;

    // TODO Make this multi-lingual text

    /**
     * Note that to add `participants` to the transcript, you must run
     * subsequent `ADD_PARTICIPANT_TO_TRANSCRIPT` commands.
     *
     *  Note that to add `items` to the transcript, you must run subsequent
     * `ADD_ITEM_TO_TRANSCRIPT` commands.
     *
     */
}
