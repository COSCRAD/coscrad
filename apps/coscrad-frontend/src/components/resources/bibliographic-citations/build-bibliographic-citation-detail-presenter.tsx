import {
    BibliographicCitationType,
    IBibliographicCitationViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { BookBibliographicCitationDetailFullViewPresenter } from './book-bibliographic-citation-detail.full-view.presenter';
import { CourtCaseBibliographicCitationDetailFullViewPresenter } from './court-case-bibliographic-citation-detail.full-view.presenter';
import { JournalArticleBibliographicCitationDetailFullViewPresenter } from './journal-article-bibliographic-citation-detail.full-view.presenter';

type Presenter = FunctionalComponent<
    ICategorizableDetailQueryResult<IBibliographicCitationViewModel>
>;

const lookupTable: {
    [K in BibliographicCitationType]: FunctionalComponent<IBibliographicCitationViewModel>;
} = {
    [BibliographicCitationType.book]: BookBibliographicCitationDetailFullViewPresenter,
    [BibliographicCitationType.courtCase]: CourtCaseBibliographicCitationDetailFullViewPresenter,
    [BibliographicCitationType.journalArticle]:
        JournalArticleBibliographicCitationDetailFullViewPresenter,
};

export const buildBibliographicCitationDetailPresenter = (
    bibliographicCitationType: BibliographicCitationType
): Presenter => {
    const lookupResult = lookupTable[bibliographicCitationType];

    if (!lookupResult)
        throw new Error(
            `Failed to build a detail presenter for bibliographic citation type: ${bibliographicCitationType}`
        );

    return lookupResult;
};
