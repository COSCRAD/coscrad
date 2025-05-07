import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CommandInfoService } from '../../../../app/controllers/command/services/command-info-service';
import { IdGenerationModule } from '../../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import { AudioItemQueryService } from '../../../services/query-services/audio-item-query.service';
import { VideoQueryService } from '../../../services/query-services/video-query.service';
import {
    AddLineItemToTranscript,
    AddLineItemtoTranscriptCommandHandler,
    AddParticipantToTranscript,
    AddParticipantToTranscriptCommandHandler,
    AudioItemNameTranslatedEventHandler,
    CreateAudioItem,
    CreateAudioItemCommandHandler,
    CreateTranscript,
    CreateTranscriptCommandHandler,
    ImportTranslationsForTranscript,
    ImportTranslationsForTranscriptCommandHandler,
    TranslateAudioItemName,
    TranslateAudioItemNameCommandHandler,
    TranslateLineItem,
    TranslateLineItemCommandHandler,
} from '../audio-item/commands';
import { AudioItemCreated } from '../audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItemCreatedEventHandler } from '../audio-item/commands/create-audio-item/audio-item-created.event-handler';
import { AudioItemNameTranslated } from '../audio-item/commands/translate-audio-item-name/audio-item-name-translated-event';
import { LineItemAddedToTranscript } from '../shared/commands/transcripts/add-line-item-to-transcript/line-item-added-to-transcript.event';
import { LineItemAddedToTranscriptEventHandler } from '../shared/commands/transcripts/add-line-item-to-transcript/line-item-added-to-transcript.event-handler';
import { ParticipantAddedToTranscript } from '../shared/commands/transcripts/add-participant-to-transcript/participant-added-to-transcript.event';
import { ParticipantAddedToTranscriptEventHandler } from '../shared/commands/transcripts/add-participant-to-transcript/participant-added-to-transcript.event-handler';
import { TranscriptCreated } from '../shared/commands/transcripts/create-transcript/transcript-created.event';
import { TranscriptCreatedEventHandler } from '../shared/commands/transcripts/create-transcript/transcript-created.event-handler';
import {
    ImportLineItemsToTranscript,
    ImportLineItemsToTranscriptCommandHandler,
} from '../shared/commands/transcripts/import-line-items-to-transcript';
import { LineItemsImportedToTranscript } from '../shared/commands/transcripts/import-line-items-to-transcript/line-items-imported-to-transcript.event';
import { LineItemsImportedToTranscriptEventHandler } from '../shared/commands/transcripts/import-line-items-to-transcript/line-items-imported-to-transcript.event-handler';
import { TranslationsImportedForTranscsriptEventHandler } from '../shared/commands/transcripts/import-translations-for-transcript/translations-imported-for-transcript.event-handler';
import { LineItemTranslatedEventHandler } from '../shared/commands/transcripts/translate-line-item/line-item-translated.event-handler';
import {
    CreateVideo,
    CreateVideoCommandHandler,
    TranslateVideoName,
    TranslateVideoNameCommandHandler,
} from '../video';
import { AudioItemController } from './audio-item.controller';
import { VideoController } from './video.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [AudioItemController, VideoController],
    providers: [
        CommandInfoService,
        AudioItemQueryService,
        VideoQueryService,
        CreateVideo,
        CreateVideoCommandHandler,
        TranslateVideoName,
        TranslateVideoNameCommandHandler,
        CreateAudioItem,
        CreateAudioItemCommandHandler,
        TranslateAudioItemName,
        TranslateAudioItemNameCommandHandler,
        CreateTranscript,
        CreateTranscriptCommandHandler,
        AddLineItemToTranscript,
        AddLineItemtoTranscriptCommandHandler,
        AddParticipantToTranscript,
        AddParticipantToTranscriptCommandHandler,
        TranslateLineItem,
        TranslateLineItemCommandHandler,
        ImportLineItemsToTranscript,
        ImportLineItemsToTranscriptCommandHandler,
        ImportTranslationsForTranscript,
        ImportTranslationsForTranscriptCommandHandler,
        // events
        ...[
            AudioItemCreated,
            AudioItemNameTranslated,
            TranscriptCreated,
            ParticipantAddedToTranscript,
            LineItemAddedToTranscript,
            LineItemsImportedToTranscript,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
        // Event Handlers
        AudioItemCreatedEventHandler,
        AudioItemNameTranslatedEventHandler,
        TranscriptCreatedEventHandler,
        ParticipantAddedToTranscriptEventHandler,
        LineItemAddedToTranscriptEventHandler,
        LineItemsImportedToTranscriptEventHandler,
        LineItemTranslatedEventHandler,
        TranslationsImportedForTranscsriptEventHandler,
    ],
    exports: [AudioItemQueryService, VideoQueryService],
})
export class AudioVisualModule {}
