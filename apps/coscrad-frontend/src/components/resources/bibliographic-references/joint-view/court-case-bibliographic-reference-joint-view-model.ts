import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { formatCitationInformation } from './shared';
import { BibliographicReferenceJointViewModel } from './types';

export const CourtCaseBibliographicReferenceJointViewModel = ({
    id,
    data: { caseName, dateDecided, court, pages },
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): BibliographicReferenceJointViewModel => ({
    type: 'Court Case',
    id,
    title: caseName,
    citation: formatCitationInformation([court, pages], dateDecided),
});
