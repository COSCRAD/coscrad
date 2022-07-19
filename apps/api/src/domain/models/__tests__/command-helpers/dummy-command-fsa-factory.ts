import { FluxStandardAction, ICommand } from '@coscrad/commands';
import { AggregateId } from '../../../types/AggregateId';

export class DummyCommandFSAFactory<T extends ICommand> {
    // TODO make building a valid FSA the responsibility of this class as well
    constructor(private readonly buildValidFSA: (id?: AggregateId) => FluxStandardAction<T>) {}

    build(
        id?: AggregateId,
        payloadOverrides: Partial<Record<keyof T, unknown>> = {}
    ): FluxStandardAction<T> {
        const { type, payload: validPayload } = this.buildValidFSA(id);

        return {
            type,
            payload: {
                ...validPayload,
                ...(payloadOverrides as Partial<T>),
            },
        };
    }
}
