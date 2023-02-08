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
} from '../../domain/models/audio-item/commands';
import { AudioItemQueryService } from '../../domain/services/query-services/audio-item-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { AudioItemController } from '../controllers/resources/audio-item.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [AudioItemController],
    providers: [
        CommandInfoService,
        AudioItemQueryService,
        CreateAudioItem,
        CreateAudioItemCommandHandler,
        CreateTranscript,
        CreateTranscriptCommandHandler,
        AddParticipantToTranscript,
        AddParticipantToTranscriptCommandHandler,
        AddLineItemToTranscript,
        AddLineItemtoTranscriptCommandHandler,
    ],
})
export class AudioItemModule {}
