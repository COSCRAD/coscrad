import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { PhotographQueryService } from '../../domain/services/query-services/photograph-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { PhotographController } from '../controllers/resources/photograph.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [PhotographController],
    providers: [CommandInfoService, PhotographQueryService],
})
export class PhotographModule {}
