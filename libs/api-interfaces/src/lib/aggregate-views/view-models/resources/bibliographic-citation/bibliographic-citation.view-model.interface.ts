import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IBibliographicCitationData } from './bibliographic-citation-data/bibliographic-citation-data.interface';

export interface IBibliographicCitationViewModel<
    TData extends IBibliographicCitationData = IBibliographicCitationData
> extends IBaseResourceViewModel {
    data: TData;
}
