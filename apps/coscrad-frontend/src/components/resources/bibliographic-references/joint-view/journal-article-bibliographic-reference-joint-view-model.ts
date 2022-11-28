import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { formatCitationInfromation } from './shared';
import { BibliographicReferenceJointViewModel } from './types';

export const JournalArticleBibliographicReferenceJointViewModel = ({
    id,
    data: { title, issueDate, publicationTitle, issn, doi },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): BibliographicReferenceJointViewModel => ({
    type: 'Journal Article',
    id,
    title,
    citation: formatCitationInfromation([publicationTitle, issn, doi], issueDate),
});
