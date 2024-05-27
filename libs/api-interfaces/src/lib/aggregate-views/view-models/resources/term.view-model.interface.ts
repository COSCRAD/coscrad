import { IBaseResourceViewModel } from '../base.view-model.interface';

export interface ITermViewModel extends IBaseResourceViewModel {
    audioURL?: string;

    sourceProject?: string;
}
