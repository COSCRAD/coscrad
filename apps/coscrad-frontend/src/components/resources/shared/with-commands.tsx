import {
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    isAggregateType,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { CommandContext, CommandPanel } from '../../commands';
import { buildCommandExecutor, buildDynamicCommandForm } from '../../commands/command-executor';

export const WithCommands =
    <TProps,>(
        WrappedComponent: FunctionalComponent<TProps>,
        mapPropsToActions: (props: TProps) => IBackendCommandFormAndLabels[],
        mapPropsToCommandContext: (props: TProps) => CommandContext
    ) =>
    (props: TProps) => {
        const actions = mapPropsToActions(props);

        const commandContext = mapPropsToCommandContext(props);

        return actions.length > 0 ? (
            <>
                {WrappedComponent(props)}
                <CommandPanel
                    actions={actions.map((action) => ({
                        ...action,
                        executor: isAggregateType(commandContext)
                            ? buildCommandExecutor(
                                  buildDynamicCommandForm(action),
                                  {},
                                  commandContext
                              )
                            : buildCommandExecutor(buildDynamicCommandForm(action), {
                                  aggregateCompositeIdentifier: commandContext,
                              }),
                    }))}
                />
            </>
        ) : (
            WrappedComponent(props)
        );
    };
