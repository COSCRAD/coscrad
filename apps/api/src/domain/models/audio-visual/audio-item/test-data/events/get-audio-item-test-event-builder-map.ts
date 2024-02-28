import { EventBuilder } from '../../../../../../test-data/events';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import {
    buildAudioItemCreated,
    buildAudioItemNameTranslated,
    buildLineItemAddedToTranscript,
    buildLineItemTranslated,
    buildLineItemsImportedToTranscript,
    buildPArticipantAddedToTranscript,
    buildTranscriptCreated,
    buildTranslationsImportedForTranscript,
} from './builders';

export const getAudioItemTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set('AUDIO_ITEM_CREATED', buildAudioItemCreated)
        .set('AUDIO_ITEM_NAME_TRANSLATED', buildAudioItemNameTranslated)
        .set('TRANSCRIPT_CREATED', buildTranscriptCreated)
        .set('PARTICIPANT_ADDED_TO_TRANSCRIPT', buildPArticipantAddedToTranscript)
        .set('LINE_ITEM_ADDED_TO_TRANSCRIPT', buildLineItemAddedToTranscript)
        .set('LINE_ITEM_TRANSLATED', buildLineItemTranslated)
        .set('LINE_ITEMS_IMPORTED_TO_TRANSCRIPT', buildLineItemsImportedToTranscript)
        .set('TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT', buildTranslationsImportedForTranscript);
