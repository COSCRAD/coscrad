import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { TranscribedAudioQueryService } from '../../domain/services/query-services/transribed-audio-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { TranscribedAudioController } from '../controllers/resources/transcribed-audio.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [TranscribedAudioController],
    providers: [CommandInfoService, TranscribedAudioQueryService],
})
export class TranscribedAudioModule {}
