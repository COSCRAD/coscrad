import { ResourceType } from '../../../types/ResourceType';
import BaseDomainModel from '../../BaseDomainModel';
import { Resource } from '../../resource.entity';
import { IBibliographicReferenceData } from './bibliographic-reference-data.interface';

export interface IBibliographicReference<
    T extends IBibliographicReferenceData = IBibliographicReferenceData
> extends Resource {
    type: typeof ResourceType.bibliographicReference;

    data: T & BaseDomainModel;
}
