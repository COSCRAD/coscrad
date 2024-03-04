import {
    BibliographicCitationType,
    IBibliographicCitationViewModel,
} from '@coscrad/api-interfaces';
import { BookBibliographicCitationJointViewModel } from './book-bibliographic-citation-joint-view-model';
import { CourtCaseBibliographicCitationJointViewModel } from './court-case-bibliographic-citation-joint-view-model';
import { JournalArticleBibliographicCitationJointViewModel } from './journal-article-bibliographic-citation-joint-view-model';
import { BibliographicCitationJointViewModel } from './types';

/**
 * We are adapting the union of view models to a single, common (i.e. consolidated)
 * view model to be presented together in a table, for example.
 */
type ViewModelAdapter = (
    specificModel: IBibliographicCitationViewModel
) => BibliographicCitationJointViewModel;

const lookupTable: { [K in BibliographicCitationType]: ViewModelAdapter } = {
    [BibliographicCitationType.book]: BookBibliographicCitationJointViewModel,
    [BibliographicCitationType.courtCase]: CourtCaseBibliographicCitationJointViewModel,
    [BibliographicCitationType.journalArticle]: JournalArticleBibliographicCitationJointViewModel,
};

export const buildBibliographicCitationJointViewModel = (
    specificViewModel: IBibliographicCitationViewModel
): BibliographicCitationJointViewModel => {
    const {
        data: { type: bibliographicCitationType },
    } = specificViewModel;

    const adapterLookupResult = lookupTable[bibliographicCitationType];

    if (!adapterLookupResult) {
        throw new Error(
            `Failed to build a consolidated index view for Bibliographic Citation model of unknown type: ${bibliographicCitationType}`
        );
    }

    return adapterLookupResult(specificViewModel);
};
