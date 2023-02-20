import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddLineItemToTranscript,
    AddLineItemtoTranscriptCommandHandler,
    AddParticipantToTranscriptCommandHandler,
    CreateAudioItem,
    CreateAudioItemCommandHandler,
    CreateTranscript,
    CreateTranscriptCommandHandler,
} from '../../domain/models/audio-item/commands';
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
        CreateAudioItem,
        CreateAudioItemCommandHandler,
        CreateTranscript,
        CreateTranscriptCommandHandler,
        AddLineItemToTranscript,
        AddLineItemtoTranscriptCommandHandler,
        AddLineItemtoTranscriptCommandHandler,
        AddParticipantToTranscriptCommandHandler,
    ],
})
export class AudioVisualModule {}
