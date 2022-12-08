import { WithTags } from './aggregate-views';
import { ICommandFormAndLabels } from './commands';
import { IViewModel } from './view-model.interface';

export interface IDetailQueryResult<UViewModel extends IViewModel = IViewModel> {
    data: WithTags<UViewModel>;
    actions: ICommandFormAndLabels[];
}
