import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { BibliographicReferenceJointViewModel } from './types';

export const JournalArticleBibliographicReferenceJointViewModel = ({
    id,
    data: { title, issueDate, publicationTitle, issn, doi },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): BibliographicReferenceJointViewModel => ({
    type: 'Journal Article',
    id,
    title,
    citation: `${[publicationTitle, issn, doi]
        .filter((value) => value !== null && typeof value !== undefined)
        .join(',')} (${issueDate})`,
});
