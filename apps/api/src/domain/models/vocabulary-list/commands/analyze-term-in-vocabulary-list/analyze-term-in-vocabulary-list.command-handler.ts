import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { AnalyzeTermInVocabularyList } from './analyze-term-in-vocabulary-list.command';
import { TermInVocabularyListAnalyzed } from './term-in-vocabulary-list-analyzed.event';

@CommandHandler(AnalyzeTermInVocabularyList)
export class AnalyzeTermInVocabularyListCommandHandler extends BaseUpdateCommandHandler<VocabularyList> {
    protected actOnInstance(
        vocabularyList: VocabularyList,
        { termId, propertyValues: propertyDefinition }: AnalyzeTermInVocabularyList
    ): ResultOrError<VocabularyList> {
        return vocabularyList.analyzeEntry(termId, propertyDefinition);
    }

    protected async fetchRequiredExternalState({
        termId,
    }: AnalyzeTermInVocabularyList): Promise<InMemorySnapshot> {
        const termSearchResult = await this.repositoryProvider
            .forResource(AggregateType.term)
            .fetchById(termId);

        if (isInternalError(termSearchResult)) {
            throw new InternalError(`Encountered invalid existing state in the database`, [
                termSearchResult,
            ]);
        }

        const terms = isNotFound(termSearchResult) ? [] : [termSearchResult];

        return Promise.resolve(
            new DeluxeInMemoryStore({
                [AggregateType.term]: terms,
            }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _vocabularyList: VocabularyList
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AnalyzeTermInVocabularyList,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new TermInVocabularyListAnalyzed(command, eventMeta);
    }
}
