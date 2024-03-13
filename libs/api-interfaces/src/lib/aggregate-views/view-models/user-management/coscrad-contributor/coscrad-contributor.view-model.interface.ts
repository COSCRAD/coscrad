import { IBaseViewModel } from '../../base.view-model.interface';

export interface ICoscradContributorViewModel extends IBaseViewModel {
    label: string;

    description: string;

    fullName: string;

    // dateOfBirth?: CoscradDate;

    shortBio?: string;
}
