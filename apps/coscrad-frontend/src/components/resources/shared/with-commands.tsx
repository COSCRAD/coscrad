import { IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandPanel } from '../../commands';

export const WithCommands =
    (WrappedComponent: FunctionalComponent<IDetailQueryResult<IBaseViewModel>>) =>
    (props: IDetailQueryResult<IBaseViewModel>) =>
        (
            <div>
                {WrappedComponent(props as unknown as T)}
                <CommandPanel actions={props.actions} />
            </div>
        );
