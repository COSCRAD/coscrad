import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER } from '../../../../persistence/constants/persistenceConstants';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { Valid } from '../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { Transcript } from '../entities/transcribed-audio.entity';
import { CreateTranscript } from './create-transcript.command';
import { TranscriptCreated } from './transcript-created.event';

// Note that the generic passed to Transcript can be the broadest union \ base type as we won't add items with this command
@CommandHandler(CreateTranscript)
export class CreateTranscriptCommandHandler extends BaseCreateCommandHandler<Transcript> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Transcript>;

    protected aggregateType: AggregateType = AggregateType.transcribedAudio;

    constructor(
        @Inject(REPOSITORY_PROVIDER) protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<Transcript>(
            ResourceType.transcribedAudio
        );
    }

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        name,
        mediaItemId,
        lengthMilliseconds,
    }: CreateTranscript) {
        return new Transcript({
            type: AggregateType.transcribedAudio,
            id,
            name,
            mediaItemId,
            lengthMilliseconds,
            // TODO Consider defaulting these in the constructor
            published: false,
            participants: [],
            items: [],
        });
    }

    protected async fetchRequiredExternalState({
        mediaItemId,
    }: CreateTranscript): Promise<InMemorySnapshot> {
        const mediaItemSearchResult = await this.repositoryProvider
            .forResource(AggregateType.mediaItem)
            .fetchById(mediaItemId);

        if (isInternalError(mediaItemSearchResult)) {
            throw new InternalError(
                `Failed to fetch existing state as ${formatAggregateCompositeIdentifier({
                    type: AggregateType.mediaItem,
                    id: mediaItemId,
                })} has invalid state.`,
                [mediaItemSearchResult]
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.mediaItem]: isNotFound(mediaItemSearchResult)
                ? []
                : [mediaItemSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        snapshot: InMemorySnapshot,
        instance: Transcript
    ): InternalError | Valid {
        return instance.validateExternalReferences(snapshot);
    }

    protected buildEvent(command: CreateTranscript, eventId: string, userId: string): BaseEvent {
        return new TranscriptCreated(command, eventId, userId);
    }
}
