import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandContext, CommandPanel } from '../../commands';
import { buildDynamicCommandExecutionForm } from '../../commands/dynamic-command-execution-form';

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
                <CommandPanel
                    actions={actions.map((action) => ({
                        ...action,
                        form: buildDynamicCommandExecutionForm(action),
                    }))}
                    commandContext={mapPropsToCommandContext(props)}
                />
            </div>
        ) : (
            WrappedComponent(props)
        );
    };
