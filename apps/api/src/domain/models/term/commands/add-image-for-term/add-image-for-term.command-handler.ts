import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { AddImageForTerm } from './add-image-for-term.command';
import { PhotographAddedForTerm } from './photograph-added-for-term.event';

@CommandHandler(AddImageForTerm)
export class AddImageForTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected actOnInstance(
        term: Term,
        { photographId: photographId }: AddImageForTerm
    ): ResultOrError<Term> {
        return term.addPhotophraph(photographId);
    }

    protected async fetchRequiredExternalState({
        photographId: photograpgId,
    }: AddImageForTerm): Promise<InMemorySnapshot> {
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

    protected buildEvent(payload: AddImageForTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new PhotographAddedForTerm(payload, eventMeta);
    }
}
