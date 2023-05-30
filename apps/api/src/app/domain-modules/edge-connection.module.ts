import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    CreateNoteAboutResource,
    CreateNoteAboutResourceCommandHandler,
} from '../../domain/models/context/commands';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { EdgeConnectionController } from '../controllers/edgeConnection.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [EdgeConnectionController],
    providers: [
        CommandInfoService,
        EdgeConnectionQueryService,
        CreateNoteAboutResource,
        CreateNoteAboutResourceCommandHandler,
    ],
})
export class EdgeConnectionModule {}
