import { IBaseViewModel } from '../../base.view-model.interface';

export interface ICoscradContributorViewModel extends IBaseViewModel {
    fullName: string;

    shortBio?: string;
}
