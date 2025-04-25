import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../../../domain/common/events/interfaces';
import { BaseUpdateCommandHandler } from '../../../../../../../domain/models/shared/command-handlers/base-update-command-handler';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { CreateTranscript } from './create-transcript.command';
import { TranscriptCreated } from './transcript-created.event';

@CommandHandler(CreateTranscript)
export class CreateTranscriptCommandHandler extends BaseUpdateCommandHandler<AudioItem | Video> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier: { type, id },
    }: CreateTranscript): Promise<ResultOrError<AudioItem | Video>> {
        const searchResult = await this.repositoryProvider
            .forResource<AudioItem | Video>(type)
            .fetchById(id);

        if (isNotFound(searchResult)) return new AggregateNotFoundError({ type, id });

        return searchResult;
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        // should we program to `HasCreateTranscript` or `Transcribable` here?
        instance: AudioItem | Video,
        _command: CreateTranscript
    ): ResultOrError<AudioItem | Video> {
        return instance.createTranscript() as unknown as AudioItem | Video;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        __instance: AudioItem
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(command: CreateTranscript, eventMeta: EventRecordMetadata): BaseEvent {
        return new TranscriptCreated(command, eventMeta);
    }
}
