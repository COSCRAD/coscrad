import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateBookBibliographicCitation } from '../../domain/models/bibliographic-citation/book-bibliographic-citation/commands/create-book-bibliographic-citation/create-book-bibliographic-citation.command';
import { CreateBookBibliographicCitationCommandHandler } from '../../domain/models/bibliographic-citation/book-bibliographic-citation/commands/create-book-bibliographic-citation/create-book-bibliographic-citation.command-handler';
import BookBibliographicCitationData from '../../domain/models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation-data.entity';
import { RegisterDigitalRepresentationOfBibliographicCitation } from '../../domain/models/bibliographic-citation/common/commands/register-digital-representation-of-bibiliographic-citation';
import { RegisterDigitalRepresentationOfBibliographicCitationCommandHandler } from '../../domain/models/bibliographic-citation/common/commands/register-digital-representation-of-bibiliographic-citation/register-digital-representation-of-bibliographic-citation.command-handler';
import { CreateCourtCaseBibliographicCitation } from '../../domain/models/bibliographic-citation/court-case-bibliographic-citation/commands/create-court-case-bibliographic-citation/create-court-case-bibliographic-citation.command';
import { CreateCourtCaseBibliographicCitationCommandHandler } from '../../domain/models/bibliographic-citation/court-case-bibliographic-citation/commands/create-court-case-bibliographic-citation/create-court-case-bibliographic-citation.command-handler';
import { CourtCaseBibliographicCitationData } from '../../domain/models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation-data.entity';
import { CreateJournalArticleBibliographicCitation } from '../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/commands/create-journal-article-bibliographic-citation.command';
import { CreateJournalArticleBibliographicCitationCommandHandler } from '../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/commands/create-journal-article-bibliographic-citation.command-handler';
import JournalArticleBibliographicCitationData from '../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation-data.entity';
import { BibliographicCitationDataUnion } from '../../domain/models/bibliographic-citation/shared';
import { BibliographicCitationQueryService } from '../../domain/services/query-services/bibliographic-citation-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { BibliographicCitationViewModel } from '../../queries/buildViewModelForResource/viewModels/bibliographic-citation/bibliographic-citation.view-model';
import { DynamicDataTypeModule } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { BibliographicCitationController } from '../controllers/resources/bibliographic-citation.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule, DynamicDataTypeModule],
    controllers: [BibliographicCitationController],
    providers: [
        CommandInfoService,
        BibliographicCitationQueryService,
        CreateBookBibliographicCitation,
        CreateBookBibliographicCitationCommandHandler,
        CreateJournalArticleBibliographicCitation,
        CreateJournalArticleBibliographicCitationCommandHandler,
        CreateCourtCaseBibliographicCitation,
        CreateCourtCaseBibliographicCitationCommandHandler,
        CourtCaseBibliographicCitationData,
        RegisterDigitalRepresentationOfBibliographicCitation,
        RegisterDigitalRepresentationOfBibliographicCitationCommandHandler,
        // Data Classes
        ...[
            BibliographicCitationDataUnion,
            BibliographicCitationViewModel,
            BookBibliographicCitationData,
            JournalArticleBibliographicCitationData,
            CourtCaseBibliographicCitationData,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class BibliographicCitationModule {}
