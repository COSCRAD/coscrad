import { AggregateType, IBibliographicCitationViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { BibliographicCitationViewModel } from '../../../queries/buildViewModelForResource/viewModels/bibliographic-citation/bibliographic-citation.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { BookBibliographicCitation } from '../../models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { CourtCaseBibliographicCitation } from '../../models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation.entity';
import { IBibliographicCitationData } from '../../models/bibliographic-citation/interfaces/bibliographic-citation-data.interface';
import { IBibliographicCitation } from '../../models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { JournalArticleBibliographicCitation } from '../../models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class BibliographicCitationQueryService extends ResourceQueryService<
    IBibliographicCitation,
    IBibliographicCitationViewModel
> {
    protected readonly type = ResourceType.bibliographicCitation;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [contributorSearchResult] = await Promise.all([
            this.repositoryProvider.getContributorRepository().fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [AggregateType.contributor]: contributorSearchResult.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        bibliographicCitationInstance: IBibliographicCitation<IBibliographicCitationData>,
        { contributor: contributors }: InMemorySnapshot
    ): IBibliographicCitationViewModel {
        return new BibliographicCitationViewModel(bibliographicCitationInstance, contributors);
    }

    /**
     * We may want to have a `BibliographicCitation` base class or some other
     * mechanism to make the following method closed to modification.
     */
    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [
            BookBibliographicCitation,
            JournalArticleBibliographicCitation,
            CourtCaseBibliographicCitation,
        ];
    }
}
