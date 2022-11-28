import { IBaseViewModel } from '../../base.view-model.interface';
import { IBibliographicReferenceData } from './bibliographic-reference-data/bibliographic-reference-data.interface';

export interface IBibliographicReferenceViewModel<
    TData extends IBibliographicReferenceData = IBibliographicReferenceData
> extends IBaseViewModel {
    data: TData;
}
