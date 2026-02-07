import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { PromptRegisteredForExistingTerm } from './prompt-registered-for-existing-term.event';
import { RegisterPromptForExistingTerm } from './register-prompt-for-existing-term.command';

@CommandHandler(RegisterPromptForExistingTerm)
export class RegisterPromptForExistingTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected actOnInstance(
        instance: Term,
        { aggregateCompositeIdentifier: { id } }: RegisterPromptForExistingTerm
    ): ResultOrError<Term> {
        return instance.registerPrompt(id);
    }

    protected async fetchRequiredExternalState(
        _command?: RegisterPromptForExistingTerm
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: Term
    ): Valid | InternalError {
        return instance.validateExternalState(state);
    }

    protected buildEvent(
        payload: RegisterPromptForExistingTerm,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new PromptRegisteredForExistingTerm(payload, eventMeta);
    }
}
