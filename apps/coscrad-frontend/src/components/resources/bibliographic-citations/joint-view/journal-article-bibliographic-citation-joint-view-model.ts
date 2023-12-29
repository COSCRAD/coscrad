import {
    IBibliographicCitationViewModel,
    IJournalArticleBibliographicCitationData,
} from '@coscrad/api-interfaces';
import { formatCitationInformation } from './shared';
import { BibliographicCitationJointViewModel } from './types';

export const JournalArticleBibliographicCitationJointViewModel = ({
    id,
    data: { title, issueDate, publicationTitle, issn, doi },
}: IBibliographicCitationViewModel<IJournalArticleBibliographicCitationData>): BibliographicCitationJointViewModel => ({
    type: 'Journal Article',
    id,
    title,
    citation: formatCitationInformation([publicationTitle, issn, doi], issueDate),
});
