import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { Term } from '../../../term/entities/term.entity';
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

    protected async fetchRequiredExternalState({
        termId,
    }: AddTermToVocabularyList): Promise<InMemorySnapshot> {
        const termSearchResult = await this.repositoryProvider
            .forResource<Term>(AggregateType.term)
            .fetchById(termId);

        if (isInternalError(termSearchResult)) {
            throw new InternalError(
                `Encountered invalid existing data for ${formatAggregateCompositeIdentifier({
                    type: AggregateType.term,
                    id: termId,
                })}`
            );
        }

        const allTerms: Term[] = isNotFound(termSearchResult) ? [] : [termSearchResult];

        // We need to fetch the terms for the schema based reference validation to work
        return Promise.resolve(
            new DeluxeInMemoryStore({
                [AggregateType.term]: allTerms,
            }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected validateExternalState(
        _snapshot: InMemorySnapshot,
        _vocabularyList: VocabularyList
    ): InternalError | Valid {
        // references are validated automatically in the base handler via the schema
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
