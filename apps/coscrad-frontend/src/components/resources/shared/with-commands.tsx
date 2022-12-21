import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandPanel } from '../../commands';

export const WithCommands =
    <TProps,>(
        WrappedComponent: FunctionalComponent<TProps>,
        mapPropsToActions: (props: TProps) => ICommandFormAndLabels[]
    ) =>
    (props: TProps) =>
        (
            <div>
                {WrappedComponent(props)}
                <CommandPanel actions={mapPropsToActions(props)} />
            </div>
        );
