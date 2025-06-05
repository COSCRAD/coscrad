import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import { ResultOrError } from '../../../../../types/ResultOrError';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
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

    protected async fetchRequiredExternalState(
        _: ImportEntriesToVocabularyList
    ): Promise<InMemorySnapshot> {
        // Note that we handle the external state validation in `validateAdditionalConstraints` as a performance optimization
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: VocabularyList
    ): InternalError | Valid {
        return Valid;
    }

    protected async validateAdditionalConstraints(
        { entries, aggregateCompositeIdentifier }: ImportEntriesToVocabularyList,
        _?: InMemorySnapshot
    ): Promise<Valid | InternalError> {
        const termIdsFromPayload = entries.map(({ termId }) => termId);

        const missingTerms = await this.repositoryProvider
            .forResource(ResourceType.term)
            .exist(termIdsFromPayload);

        if (missingTerms.length == 0) {
            return Valid;
        }

        return new InvalidExternalReferenceByAggregateError(
            aggregateCompositeIdentifier,
            missingTerms.map((id) => ({
                type: AggregateType.term,
                id,
            }))
        );
    }

    /**
     * We are opting out of the magic schema-based reference validation in
     * favor of custom logic in `validateAdditionalConstraints` for performance.
     */
    protected override validateReferences(): ValidationResult {
        return Valid;
    }

    protected buildEvent(
        payload: ImportEntriesToVocabularyList,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new EntriesImportedToVocabularyList(payload, eventMeta);
    }
}
