import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { formatCitationInformation } from './shared';
import { BibliographicReferenceJointViewModel } from './types';

export const JournalArticleBibliographicReferenceJointViewModel = ({
    id,
    data: { title, issueDate, publicationTitle, issn, doi },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): BibliographicReferenceJointViewModel => ({
    type: 'Journal Article',
    id,
    title,
    citation: formatCitationInformation([publicationTitle, issn, doi], issueDate),
});
