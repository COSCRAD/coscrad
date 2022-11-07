import { IBaseViewModel } from '../../base.view-model.interface';
import { IBibliographicReferenceData } from './bibliographic-reference-data.interface';

export interface IBibliographicReferenceViewModel extends IBaseViewModel {
    data: IBibliographicReferenceData;
}
