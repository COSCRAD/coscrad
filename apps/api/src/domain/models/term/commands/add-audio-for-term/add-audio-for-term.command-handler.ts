import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { AddAudioForTerm } from './add-audio-for-term.command';
import { AudioAddedForTerm } from './audio-added-for-term.event';

@CommandHandler(AddAudioForTerm)
export class AddAudioForTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected actOnInstance(instance: Term, { audioItemId }: AddAudioForTerm): ResultOrError<Term> {
        return instance.addAudio(audioItemId);
    }

    protected async fetchRequiredExternalState({
        audioItemId,
    }: AddAudioForTerm): Promise<InMemorySnapshot> {
        const audioItemSearchResult = await this.repositoryProvider
            .forResource(ResourceType.audioItem)
            .fetchById(audioItemId);

        if (isInternalError(audioItemSearchResult)) {
            throw new InternalError('failed to fetch audio item to add to term', [
                audioItemSearchResult,
            ]);
        }

        const allAudioItems = isNotFound(audioItemSearchResult) ? [] : [audioItemSearchResult];

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: allAudioItems,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Term
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(command: AddAudioForTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new AudioAddedForTerm(command, eventMeta);
    }
}
