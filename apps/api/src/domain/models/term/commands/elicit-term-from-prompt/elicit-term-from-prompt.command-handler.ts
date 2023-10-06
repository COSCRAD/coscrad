import { CommandHandler, ICommand } from '@coscrad/commands';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { Term } from '../../entities/term.entity';
import { ElicitTermFromPrompt } from './elicit-term-from-prompt.command';

@CommandHandler(ElicitTermFromPrompt)
export class ElicitTermFromPromptCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected fetchRequiredExternalState(_: ElicitTermFromPrompt): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(instance: Term, command: ICommand): ResultOrError<Term> {}
}
