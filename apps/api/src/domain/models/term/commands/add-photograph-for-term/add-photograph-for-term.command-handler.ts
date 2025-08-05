import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { AddPhotograhForTerm } from './add-photograph-for-term.command';
import { PhotographAddedForTerm } from './photograph-added-for-term.event';

@CommandHandler(AddPhotograhForTerm)
export class AddPhotographForTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected actOnInstance(
        term: Term,
        { photographId: photographId }: AddPhotograhForTerm
    ): ResultOrError<Term> {
        return term.addPhotophraph(photographId);
    }

    protected async fetchRequiredExternalState({
        photographId: photograpgId,
    }: AddPhotograhForTerm): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource(ResourceType.photograph)
            .fetchById(photograpgId);

        if (isInternalError(searchResult)) {
            throw searchResult;
        }

        return new DeluxeInMemoryStore({
            photograph: isNotFound(searchResult) ? [] : [searchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Term
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(payload: AddPhotograhForTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new PhotographAddedForTerm(payload, eventMeta);
    }
}
