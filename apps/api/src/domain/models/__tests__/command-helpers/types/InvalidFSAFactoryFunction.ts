import { FluxStandardAction, ICommand } from '@coscrad/commands';
import { AggregateId } from '../../../../types/AggregateId';

export type InvalidFSAFactoryFunction<TCommand extends ICommand> = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof TCommand, unknown>>
) => FluxStandardAction<TCommand>;
