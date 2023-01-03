import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandContext, CommandPanel } from '../../commands';

export const WithCommands =
    <TProps,>(
        WrappedComponent: FunctionalComponent<TProps>,
        mapPropsToActions: (props: TProps) => ICommandFormAndLabels[],
        mapPropsToCommandContext: (props: TProps) => CommandContext
    ) =>
    (props: TProps) => {
        const actions = mapPropsToActions(props);

        return actions.length > 0 ? (
            <div>
                {WrappedComponent(props)}
                <CommandPanel actions={actions} commandContext={mapPropsToCommandContext(props)} />
            </div>
        ) : (
            WrappedComponent(props)
        );
    };
