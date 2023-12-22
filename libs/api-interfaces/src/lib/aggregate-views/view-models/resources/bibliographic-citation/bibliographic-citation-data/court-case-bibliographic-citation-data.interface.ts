import { BibliographicCitationType } from '../bibliographic-citation-type.enum';

export interface ICourtCaseBibliographicCitationData {
    type: BibliographicCitationType.courtCase;
    caseName: string;
    abstract?: string;
    dateDecided?: string;
    court?: string;
    url?: string;
    pages?: string;
}
