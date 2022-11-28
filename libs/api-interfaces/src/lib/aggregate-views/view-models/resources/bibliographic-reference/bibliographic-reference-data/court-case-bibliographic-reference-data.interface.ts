import { BibliographicReferenceType } from '../bibliographic-reference-type.enum';

export interface ICourtCaseBibliographicReferenceData {
    type: BibliographicReferenceType.courtCase;
    caseName: string;
    abstract?: string;
    dateDecided?: string;
    court?: string;
    url?: string;
    pages?: string;
}
