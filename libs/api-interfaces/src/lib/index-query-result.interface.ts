import { ICommandInfo } from './command-info.interface';
import { IDetailQueryResult } from './detail-query-result.interface';
import { IViewModel } from './view-model.interface';

export interface IIndexQueryResult<UViewModel extends IViewModel = IViewModel> {
    data: IDetailQueryResult<UViewModel>[];
    actions: ICommandInfo[];
}
