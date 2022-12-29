import { AggregateCompositeIdentifier } from './aggregate-views';

export const AGGREGATE_COMPOSITE_IDENTIFIER = 'aggregateCompositeIdentifier';

export interface ICommandBase {
    /**
     * Every command has this property, which stores the context of the command,
     * i.e. the composite identifier of the single aggregate whose state is
     * updated via this command.
     */
    [AGGREGATE_COMPOSITE_IDENTIFIER]: AggregateCompositeIdentifier;
}
