import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { AnalyzeTermInVocabularyList } from './analyze-term-in-vocabulary-list.command';
import { TermInVocabularyListAnalyzed } from './term-in-vocabulary-list-analyzed.event';

@CommandHandler(AnalyzeTermInVocabularyList)
export class AnalyzeTermInVocabularyListCommandHandler extends BaseUpdateCommandHandler<VocabularyList> {
    protected actOnInstance(
        vocabularyList: VocabularyList,
        { termId, propertyName, propertyValue }: AnalyzeTermInVocabularyList
    ): ResultOrError<VocabularyList> {
        return vocabularyList.analyzeEntry(termId, propertyName, propertyValue);
    }

    protected fetchRequiredExternalState(
        _command: AnalyzeTermInVocabularyList
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _vocabularyList: VocabularyList
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AnalyzeTermInVocabularyList,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new TermInVocabularyListAnalyzed(command, eventId, userId);
    }
}
