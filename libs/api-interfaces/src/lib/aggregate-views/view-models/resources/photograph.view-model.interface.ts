import { IBaseViewModel } from '../base.view-model.interface';

export interface IPhotographViewModel extends IBaseViewModel {
    mediaItemId?: string;

    photographer: string;
}
