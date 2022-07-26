import BaseDomainModel from '../../BaseDomainModel';
import { IBibliographicReferenceData } from '../interfaces/bibliographic-reference-data.interface';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';

export class CourtCaseBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.courtCase;
}
