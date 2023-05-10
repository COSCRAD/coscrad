import { IBaseViewModel } from '../base.view-model.interface';

export interface IPhotographViewModel extends IBaseViewModel {
    // Eventually, this should be a digital asset ID
    imageUrl: string;

    photographer: string;
}
