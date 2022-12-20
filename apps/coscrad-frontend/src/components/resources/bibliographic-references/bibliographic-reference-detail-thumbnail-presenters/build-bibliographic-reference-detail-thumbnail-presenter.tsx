import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { BookBibliographicReferenceDetailThumbnailPresenter } from './book-bibliographic-reference-detail.thumbnail.presenter';
import { CourtCaseBibliographicReferenceDetailThumbnailPresenter } from './court-case-bibliographic-reference-detail.thumbnail.presenter';
import { JournalArticleBibliographicReferenceThumbnailPresenter } from './journal-article-bibliographic-reference-detail.thumbnail.presenter';

type Presenter = FunctionalComponent<
    ICategorizableDetailQueryResult<IBibliographicReferenceViewModel>
>;

const lookupTable: {
    [K in BibliographicReferenceType]: FunctionalComponent<IBibliographicReferenceViewModel>;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReferenceDetailThumbnailPresenter,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReferenceDetailThumbnailPresenter,
    [BibliographicReferenceType.journalArticle]:
        JournalArticleBibliographicReferenceThumbnailPresenter,
};

export const buildBibliographicReferenceDetailThumbnailPresenter = (
    bibliographicReferenceType: BibliographicReferenceType
): Presenter => {
    const lookupResult = lookupTable[bibliographicReferenceType];

    if (!lookupResult)
        throw new Error(
            `Failed to build a detail presenter for bibliographic reference type: ${bibliographicReferenceType}`
        );

    return lookupResult;
};
