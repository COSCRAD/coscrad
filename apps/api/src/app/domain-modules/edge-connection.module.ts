import { Module } from '@nestjs/common';
import { CommandModule } from '../../../../../libs/commands/src';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { EdgeConnectionController } from '../controllers/edgeConnection.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [EdgeConnectionController],
    providers: [CommandInfoService, EdgeConnectionQueryService],
})
export class EdgeConnectionModule {}
