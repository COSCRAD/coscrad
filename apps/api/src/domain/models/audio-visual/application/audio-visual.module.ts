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
import {
    ImportLineItemsToTranscript,
    ImportLineItemsToTranscriptCommandHandler,
} from '../shared/commands/transcripts/import-line-items-to-transcript';
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
        ...[AudioItemCreated, AudioItemNameTranslated].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
        // Event Handlers
        AudioItemCreatedEventHandler,
        AudioItemNameTranslatedEventHandler,
    ],
    exports: [AudioItemQueryService, VideoQueryService],
})
export class AudioVisualModule {}
