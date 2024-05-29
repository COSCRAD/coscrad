import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { EntriesImportedToVocabularyList } from './entries-imported-to-vocabulary-list.event';
import { ImportEntriesToVocabularyList } from './import-entries-to-vocabulary-list.command';

@CommandHandler(ImportEntriesToVocabularyList)
export class ImportEntriesToVocabularyListCommandHandler extends BaseUpdateCommandHandler<VocabularyList> {
    protected actOnInstance(
        vocabularyList: VocabularyList,
        { entries }: ImportEntriesToVocabularyList
    ): ResultOrError<VocabularyList> {
        return vocabularyList.importEntries(entries);
    }

    protected fetchRequiredExternalState(
        _command: ImportEntriesToVocabularyList
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: VocabularyList
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: ImportEntriesToVocabularyList,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new EntriesImportedToVocabularyList(payload, eventMeta);
    }
}
