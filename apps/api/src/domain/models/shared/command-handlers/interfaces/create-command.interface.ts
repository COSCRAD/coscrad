import { ICommand } from '@coscrad/commands';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';

/**
 * A `CREATE_X` command creates an aggregate for the first time in the system.
 * The new `id` should be generated using our UUID generation system.
 */
export interface ICreateCommand extends ICommand {
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}
