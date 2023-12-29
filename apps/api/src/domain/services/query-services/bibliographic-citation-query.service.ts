import { IBibliographicCitationViewModel } from '@coscrad/api-interfaces';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { BibliographicCitationViewModel } from '../../../queries/buildViewModelForResource/viewModels/bibliographic-citation/bibliographic-citation.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { BookBibliographicCitation } from '../../models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { CourtCaseBibliographicCitation } from '../../models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation.entity';
import { IBibliographicCitationData } from '../../models/bibliographic-citation/interfaces/bibliographic-citation-data.interface';
import { IBibliographicCitation } from '../../models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { JournalArticleBibliographicCitation } from '../../models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class BibliographicCitationQueryService extends ResourceQueryService<
    IBibliographicCitation,
    IBibliographicCitationViewModel
> {
    protected readonly type = ResourceType.bibliographicCitation;

    buildViewModel(
        bibliographicCitationInstance: IBibliographicCitation<IBibliographicCitationData>
    ): IBibliographicCitationViewModel {
        return new BibliographicCitationViewModel(bibliographicCitationInstance);
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
