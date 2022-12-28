import { ICommand } from '@coscrad/commands';
import { AggregateCompositeIdentifier } from './aggregate-views';

export interface ICommandBase extends ICommand {
    /**
     * Every command has this property, which stores the context of the command,
     * i.e. the composite identifier of the single aggregate whose state is
     * updated via this command.
     */
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}
