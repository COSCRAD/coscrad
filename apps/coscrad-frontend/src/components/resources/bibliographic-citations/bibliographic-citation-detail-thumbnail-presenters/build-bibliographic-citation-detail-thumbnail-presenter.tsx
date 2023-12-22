import {
    BibliographicCitationType,
    IBibliographicCitationViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { BookBibliographicCitationDetailThumbnailPresenter } from './book-bibliographic-citation-detail.thumbnail.presenter';
import { CourtCaseBibliographicCitationDetailThumbnailPresenter } from './court-case-bibliographic-citation-detail.thumbnail.presenter';
import { JournalArticleBibliographicCitationThumbnailPresenter } from './journal-article-bibliographic-citation-detail.thumbnail.presenter';

type Presenter = FunctionalComponent<
    ICategorizableDetailQueryResult<IBibliographicCitationViewModel>
>;

const lookupTable: {
    [K in BibliographicCitationType]: FunctionalComponent<IBibliographicCitationViewModel>;
} = {
    [BibliographicCitationType.book]: BookBibliographicCitationDetailThumbnailPresenter,
    [BibliographicCitationType.courtCase]: CourtCaseBibliographicCitationDetailThumbnailPresenter,
    [BibliographicCitationType.journalArticle]:
        JournalArticleBibliographicCitationThumbnailPresenter,
};

export const buildBibliographicCitationDetailThumbnailPresenter = (
    bibliographicCitationType: BibliographicCitationType
): Presenter => {
    const lookupResult = lookupTable[bibliographicCitationType];

    if (!lookupResult)
        throw new Error(
            `Failed to build a detail presenter for bibliographic citation type: ${bibliographicCitationType}`
        );

    return lookupResult;
};
