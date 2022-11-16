import { IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandPanel } from '../../commands';

export const withCommands =
    (resourceDetailPresenter: FunctionalComponent<IDetailQueryResult<IBaseViewModel>>) =>
    (detailResult: IDetailQueryResult<IBaseViewModel>) =>
        (
            <div>
                {resourceDetailPresenter(detailResult)}
                <CommandPanel {...detailResult} />
            </div>
        );
