import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddLineItemToTranscript,
    AddLineItemtoTranscriptCommandHandler,
    AddParticipantToTranscript,
    AddParticipantToTranscriptCommandHandler,
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
} from '../../domain/models/audio-item/commands';
import {
    ImportLineItemsToTranscript,
    ImportLineItemsToTranscriptCommandHandler,
} from '../../domain/models/audio-item/commands/transcripts/import-line-items-to-transcript';
import {
    CreateVideo,
    CreateVideoCommandHandler,
    TranslateVideoName,
    TranslateVideoNameCommandHandler,
} from '../../domain/models/video';
import { AudioItemQueryService } from '../../domain/services/query-services/audio-item-query.service';
import { VideoQueryService } from '../../domain/services/query-services/video-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { AudioItemController } from '../controllers/resources/audio-item.controller';
import { VideoController } from '../controllers/resources/video.controller';

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
    ],
    exports: [AudioItemQueryService, VideoQueryService],
})
export class AudioVisualModule {}
