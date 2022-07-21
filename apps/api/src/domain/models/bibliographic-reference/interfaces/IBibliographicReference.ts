import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { IBibliographicReferenceData } from './IBibliographicReferenceData';

export interface IBibliographicReference<
    T extends IBibliographicReferenceData = IBibliographicReferenceData
> extends Resource {
    type: typeof ResourceType.bibliographicReference;

    data: T;
}
