import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import {
    Ack,
    clearCommandStatus,
    useLoadableCommandResult,
} from '../../store/slices/command-status';
import { idUsed } from '../../store/slices/id-generation';
import { useFormState } from '../dynamic-forms/form-state';
import { Loading } from '../loading';
import { AckNotification } from './ack-notification';
import { CommandExecutor } from './command-executor';
import { CommandSelectionArea } from './command-selection-area';
import { CommandWorkspace } from './command-workspace';
import { NackNotification } from './nack-notification';

export const INDEX_COMMAND_CONTEXT = 'index';

export type CommandContext = AggregateType | AggregateCompositeIdentifier;

export type ICommandExecutorAndLabels = Omit<IBackendCommandFormAndLabels, 'form'> & {
    executor: CommandExecutor;
};

interface CommandAccordionProps {
    children: ReactNode;
}

const CommandAccordion = ({ children }: CommandAccordionProps) => (
    <Accordion defaultExpanded={true}>
        <AccordionSummary>
            <Typography variant="h3">Commands</Typography>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
);

interface CommandPanelProps {
    actions: ICommandExecutorAndLabels[];
}

export const CommandPanel = ({ actions }: CommandPanelProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const [formState, updateForm, clearForm] = useFormState();

    const dispatch = useAppDispatch();

    const { data: commandResult, isLoading, errorInfo } = useLoadableCommandResult();

    // Do not render if there are no available actions
    if (actions.length === 0) return null;

    const selectedCommand = actions.find((action) => action.type === selectedCommandType);

    // TODO Use `displayLoadable` helper here
    if (isLoading) return <Loading />;

    const onAcknowledgeCommandResult = (didCommandSucceed: boolean) => {
        setSelectedCommandType(null);
        dispatch(clearCommandStatus());
        clearForm();
        if (didCommandSucceed) dispatch(idUsed());
    };

    if (errorInfo !== null)
        return (
            <NackNotification
                _onClick={() => onAcknowledgeCommandResult(false)}
                errorInfo={errorInfo}
            />
        );

    /**
     * TODO Clean this up.
     *
     * This is a hack. There is some state change that is causing us to land
     * back here before the user has accepted the acknowledgement of a successful
     * command.
     */
    if (commandResult === Ack)
        return <AckNotification _onClick={() => onAcknowledgeCommandResult(true)} />;

    if (isNull(selectedCommandType))
        return (
            <CommandAccordion>
                <CommandSelectionArea
                    metaForCommands={actions}
                    onCommandSelection={(type: string) => setSelectedCommandType(type)}
                />
            </CommandAccordion>
        );

    return (
        <CommandAccordion>
            <CommandWorkspace
                executorAndLabelsForSelectedCommand={selectedCommand}
                onFieldUpdate={updateForm}
                formState={formState}
            />
        </CommandAccordion>
    );
};
