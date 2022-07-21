import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { BibliographicReferenceQueryService } from '../../domain/services/query-services/bibliographic-reference-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { BibliographicReferenceController } from '../controllers/resources/bibliographic-reference.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [BibliographicReferenceController],
    providers: [CommandInfoService, BibliographicReferenceQueryService],
})
export class BibliographicReferenceModule {}
