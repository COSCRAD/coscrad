import {
    AggregateCompositeIdentifier,
    ICommandFormAndLabels,
    isAggregateType,
} from '@coscrad/api-interfaces';
import { useLoadableGeneratedId } from '../../store/slices/id-generation';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { CommandExecutionForm } from './command-execution-form';
import { CommandContext } from './command-panel';

interface CommandExecutorProps {
    selectedCommand: ICommandFormAndLabels;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    onSubmitCommand: () => void;
    formState: Record<string, unknown>;
    commandContext: CommandContext;
}

export const CommandExecutor = (props: CommandExecutorProps): JSX.Element => {
    const { commandContext } = props;

    /**
     * The backend expects us to attach an `aggregateCompositeIdentifier` to
     * every index-scoped command and this `UUID must have been generated via the
     *  ID generation endpoint.
     */
    const loadableGeneratedId = useLoadableGeneratedId();

    const Form = displayLoadableWithErrorsAndLoading(
        CommandExecutionForm,
        (generatedId: string) => ({
            aggregateCompositeIdentifier: isAggregateType(commandContext)
                ? { type: commandContext, id: generatedId }
                : (commandContext as AggregateCompositeIdentifier),
            ...props,
        })
    );

    return <Form {...loadableGeneratedId} />;
};
