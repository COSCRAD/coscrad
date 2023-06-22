import { ICommandFormAndLabels as IBackendCommandFormAndLabels } from './commands';
import { IDetailQueryResult } from './detail-query-result.interface';
import { IViewModel } from './view-model.interface';

export interface IIndexQueryResult<UViewModel extends IViewModel = IViewModel> {
    entities: IDetailQueryResult<UViewModel>[];
    indexScopedActions: IBackendCommandFormAndLabels[];
}
