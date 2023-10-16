import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { Term } from '../../entities/term.entity';
import { ElicitTermFromPrompt } from './elicit-term-from-prompt.command';
import { TermElicitedFromPrompt } from './term.elicited.from.prompt';

@CommandHandler(ElicitTermFromPrompt)
export class ElicitTermFromPromptCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected fetchRequiredExternalState(_: ElicitTermFromPrompt): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        term: Term,
        { text, languageCode }: ElicitTermFromPrompt
    ): ResultOrError<Term> {
        return term.elicitFromPrompt(text, languageCode);
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Term
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: ElicitTermFromPrompt,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new TermElicitedFromPrompt(command, eventId, userId);
    }
}
