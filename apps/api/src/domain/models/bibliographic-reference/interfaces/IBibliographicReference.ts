import { resourceTypes } from '../../../types/resourceTypes';
import { Resource } from '../../resource.entity';
import { IBibliographicReferenceData } from './IBibliographicReferenceData';

export interface IBibliographicReference<
    T extends IBibliographicReferenceData = IBibliographicReferenceData
> extends Resource {
    type: typeof resourceTypes.bibliographicReference;

    data: T;
}
