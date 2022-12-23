import { IBaseViewModel } from '../../base.view-model.interface';
import { ICoscradUserViewModel } from '../coscrad-user';

export interface ICoscradUserGroupViewModel extends IBaseViewModel {
    label: string;

    description: string;

    users: ICoscradUserViewModel[];
}
