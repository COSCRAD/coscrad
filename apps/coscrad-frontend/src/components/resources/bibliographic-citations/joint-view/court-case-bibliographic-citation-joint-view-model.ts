import {
    IBibliographicCitationViewModel,
    ICourtCaseBibliographicCitationData,
} from '@coscrad/api-interfaces';
import { formatCitationInformation } from './shared';
import { BibliographicCitationJointViewModel } from './types';

export const CourtCaseBibliographicCitationJointViewModel = ({
    id,
    data: { caseName, dateDecided, court, pages },
}: IBibliographicCitationViewModel<ICourtCaseBibliographicCitationData>): BibliographicCitationJointViewModel => ({
    type: 'Court Case',
    id,
    title: caseName,
    citation: formatCitationInformation([court, pages], dateDecided),
});
