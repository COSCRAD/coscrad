import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
} from '@coscrad/api-interfaces';
import { BookBibliographicReferenceJointViewModel } from './book-bibliographic-reference-joint-view-model';
import { CourtCaseBibliographicReferenceJointViewModel } from './court-case-bibliographic-reference-joint-view-model';
import { JournalArticleBibliographicReferenceJointViewModel } from './journal-article-bibliographic-reference-joint-view-model';
import { BibliographicReferenceJointViewModel } from './types';

/**
 * We are adapting the union of view models to a single, common (i.e. consolidated)
 * view model to be presented together in a table, for example.
 */
type ViewModelAdapter = (
    specificModel: IBibliographicReferenceViewModel
) => BibliographicReferenceJointViewModel;

const lookupTable: { [K in BibliographicReferenceType]: ViewModelAdapter } = {
    [BibliographicReferenceType.book]: BookBibliographicReferenceJointViewModel,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReferenceJointViewModel,
    [BibliographicReferenceType.journalArticle]: JournalArticleBibliographicReferenceJointViewModel,
};

export const buildBibliographicReferenceJointViewModel = (
    specificViewModel: IBibliographicReferenceViewModel
): BibliographicReferenceJointViewModel => {
    const {
        data: { type: bibliographicReferenceType },
    } = specificViewModel;

    const adapterLookupResult = lookupTable[bibliographicReferenceType];

    if (!adapterLookupResult) {
        throw new Error(
            `Failed to build a consolidated index view for Bibliographic Reference model of unknown type: ${bibliographicReferenceType}`
        );
    }

    return adapterLookupResult(specificViewModel);
};
