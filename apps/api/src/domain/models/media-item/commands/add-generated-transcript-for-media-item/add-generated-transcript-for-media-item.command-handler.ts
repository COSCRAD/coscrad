import { CommandHandler } from '@coscrad/commands';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { MediaItem } from '../../entities/media-item.entity';
import { RawMediaItemTranscriptType } from '../../entities/raw-media-item-transcript.entity';
import { AddGeneratedTranscriptForMediaItem } from './add-generated-transcript-for-media-item.command';
import { GeneratedTranscriptAddedForMediaItem } from './generated-transcript-added-for-media-item';

@CommandHandler(AddGeneratedTranscriptForMediaItem)
export class AddGeneratedTranscriptForMediaItemCommandHandler extends BaseUpdateCommandHandler<MediaItem> {
    protected async fetchRequiredExternalState(
        command: AddGeneratedTranscriptForMediaItem
    ): Promise<InMemorySnapshot> {
        const {
            aggregateCompositeIdentifier: { id },
        } = command;

        const searchResult = await this.getRepositoryForCommand(command).fetchById(id);

        if (isNotFound(searchResult)) {
            return new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat();
        }

        if (isInternalError(searchResult)) {
            throw new InternalError(`encountered invalid existing state`, [searchResult]);
        }

        return new DeluxeInMemoryStore({
            term: [searchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        instance: MediaItem,
        { source, version, transcript }: AddGeneratedTranscriptForMediaItem
    ): ResultOrError<MediaItem> {
        return instance.addTranscript({
            source,
            version,
            data: transcript,
            type: RawMediaItemTranscriptType.asr,
        });
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: MediaItem
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(
        payload: AddGeneratedTranscriptForMediaItem,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new GeneratedTranscriptAddedForMediaItem(payload, eventMeta);
    }
}
