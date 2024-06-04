import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import IsInArray from '../../../../../domain/repositories/specifications/array-includes.specification';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
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

    protected async fetchRequiredExternalState({
        entries,
    }: ImportEntriesToVocabularyList): Promise<InMemorySnapshot> {
        const termIdsFromPayload = entries.map(({ termId }) => termId);

        const termSearchResult = await this.repositoryProvider
            .forResource(ResourceType.term)
            .fetchMany(new IsInArray('id', termIdsFromPayload));

        const terms = termSearchResult.filter(validAggregateOrThrow);

        return Promise.resolve(
            new DeluxeInMemoryStore({
                [AggregateType.term]: terms,
            }).fetchFullSnapshotInLegacyFormat()
        );
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
