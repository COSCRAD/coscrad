import BaseDomainModel from '../../BaseDomainModel';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';

export interface IBibliographicReferenceData extends BaseDomainModel {
    type: BibliographicReferenceType;
}
