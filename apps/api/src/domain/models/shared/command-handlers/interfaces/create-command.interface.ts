import { ICommand } from '../../../../../../../../libs/commands/src';
import { AggregateId } from '../../../../types/AggregateId';

/**
 * A `CREATE_X` command creates an aggregate for the first time in the system.
 * The new `id` should be generated using our UUID generation system.
 */
export interface ICreateCommand extends ICommand {
    id: AggregateId;
}
