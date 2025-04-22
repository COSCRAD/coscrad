import { IBaseResourceViewModel } from '../base.view-model.interface';

export interface IPhotographViewModel extends IBaseResourceViewModel {
    imageUrl: string;

    photographer: string;
}
