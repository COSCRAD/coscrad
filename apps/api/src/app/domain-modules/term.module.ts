import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { TermQueryService } from '../../domain/services/query-services/term-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { TermController } from '../controllers/resources/term.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [TermController],
    providers: [CommandInfoService, TermQueryService],
})
export class TermModule {}
