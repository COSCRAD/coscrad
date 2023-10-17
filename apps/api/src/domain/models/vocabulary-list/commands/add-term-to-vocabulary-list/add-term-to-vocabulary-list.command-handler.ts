import { CommandHandler, ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { AddTermToVocabularyList } from './add-term-to-vocabulary-list.command';
import { TermAddedToVocabularyList } from './term-added-to-vocabulary-list.event';

@CommandHandler(AddTermToVocabularyList)
export class AddTermtoVocabularyListCommandHandler extends BaseUpdateCommandHandler<VocabularyList> {
    protected actOnInstance(
        vocabularyListToUpdate: VocabularyList,
        { termId }: AddTermToVocabularyList
    ): ResultOrError<VocabularyList> {
        return vocabularyListToUpdate.addEntry(termId);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: VocabularyList
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddTermToVocabularyList,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new TermAddedToVocabularyList(command, eventId, userId);
    }
}
