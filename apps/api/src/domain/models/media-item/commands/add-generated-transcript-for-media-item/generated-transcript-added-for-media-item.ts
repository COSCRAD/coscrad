import { BaseEvent } from '../../../../../queries/event-sourcing';
import { AddGeneratedTranscriptForMediaItem } from './add-generated-transcript-for-media-item.command';

export type GeneratedTranscriptAddedForMediaItemPayload = AddGeneratedTranscriptForMediaItem;

export class GeneratedTranscriptAddedForMediaItem extends BaseEvent<GeneratedTranscriptAddedForMediaItemPayload> {
    readonly type = 'GENERATED_TRANSCRIPT_ADDED_FOR_MEDIA_ITEM';
}
