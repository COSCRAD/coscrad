import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { CoscradTimeStamp } from '../entities/transcribed-audio.entity';

export class TranscriptCompositeId {
    @NonEmptyString({
        label: 'type',
        description: 'transcript',
    })
    type = AggregateType.transcribedAudio;

    @UUID({
        label: 'ID',
        description: 'the transcript ID (generated)',
    })
    id: AggregateId;
}

@Command({
    type: 'CREATE_TRANSCRIPT',
    label: 'Create Transcript',
    description: 'Create a new audio or video transcript',
})
export class CreateTranscript implements ICommandBase {
    // This must be generated via our ID system and appended to the payload
    @NestedDataType(TranscriptCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: 'name',
        description: 'the name of the transcript',
    })
    readonly name: string;

    @UUID({
        label: 'media item ID',
        description: `the ID of the transcript's media item`,
    })
    @ReferenceTo(AggregateType.mediaItem)
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
