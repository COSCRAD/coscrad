import { ICommandFormAndLabels } from './commands';
import { IViewModel } from './view-model.interface';

export type IDetailQueryResult<UViewModel extends IViewModel = IViewModel> = UViewModel & {
    actions: ICommandFormAndLabels[];
};
