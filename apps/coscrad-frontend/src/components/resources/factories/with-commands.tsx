import { IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandPanel } from '../../commands';
import { AggregateDetailContainerProps } from '../../higher-order-components/aggregate-detail-container';

export const withCommands =
    (resourceDetailContainer: FunctionalComponent<AggregateDetailContainerProps>) =>
    (detailResult: IDetailQueryResult<IBaseViewModel>) =>
        (
            <div>
                {resourceDetailPresenter(detailResult)}
                <CommandPanel {...detailResult} />
            </div>
        );
