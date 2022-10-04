import { ICommandInfo } from './command-info.interface';
import { IViewModel } from './view-model.interface';

export interface IDetailQueryResult<UViewModel extends IViewModel = IViewModel> {
    data: UViewModel;
    actions: ICommandInfo[];
}
