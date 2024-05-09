import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { AudioItem } from '../../../audio-visual/audio-item/entities/audio-item.entity';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { EdgeConnection } from '../../edge-connection.entity';
import { AddAudioForNote } from './add-audio-for-note.command';
import { AudioAddedForNote } from './audio-added-for-note.event';

@CommandHandler(AddAudioForNote)
export class AddAudioForNoteCommandHandler extends BaseUpdateCommandHandler<EdgeConnection> {
    protected actOnInstance(
        edgeConnection: EdgeConnection,
        { audioItemId, languageCode }: AddAudioForNote
    ): ResultOrError<EdgeConnection> {
        const updatedInstance = edgeConnection.addAudioForNote(audioItemId, languageCode);

        return updatedInstance;
    }

    protected async fetchRequiredExternalState({
        audioItemId,
    }: AddAudioForNote): Promise<InMemorySnapshot> {
        const audioItemSearchResult = await this.repositoryProvider
            .forResource<AudioItem>(ResourceType.audioItem)
            .fetchById(audioItemId);

        if (isInternalError(audioItemSearchResult)) {
            throw new InternalError(
                `Encountered an invalid existing audio item when attempting to add audio to a edge connection note`,
                [audioItemSearchResult]
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: isNotFound(audioItemSearchResult)
                ? []
                : [audioItemSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: EdgeConnection
    ): InternalError | Valid {
        return Valid;
    }
    protected buildEvent(
        payload: AddAudioForNote,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new AudioAddedForNote(payload, eventMeta);
    }
}
