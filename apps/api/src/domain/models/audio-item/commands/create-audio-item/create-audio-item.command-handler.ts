import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../../lib/types/DomainModelCtor';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../factories/utilities/buildInstanceFactory';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AudioItem } from '../../entities/audio-item.entity';
import { CreateAudioItem } from './create-audio-item.command';
import { AudioItemCreated } from './transcript-created.event';

@CommandHandler(CreateAudioItem)
export class CreateAudioItemCommandHandler extends BaseCreateCommandHandler<AudioItem> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<AudioItem>;

    protected aggregateType: AggregateType = AggregateType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<AudioItem>(
            ResourceType.audioItem
        );
    }

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        name,
        mediaItemId,
        lengthMilliseconds,
    }: CreateAudioItem) {
        const createDto = {
            type: AggregateType.audioItem,
            id,
            name,
            mediaItemId,
            lengthMilliseconds,
            published: false,
        };

        return buildInstanceFactory(AudioItem as unknown as DomainModelCtor<AudioItem>)(createDto);

        // WARNING The following introduces circular dependencies.
        // return getInstanceFactoryForResource<AudioItem>(ResourceType.audioItem)(createDto);
    }

    protected async fetchRequiredExternalState({
        mediaItemId,
    }: CreateAudioItem): Promise<InMemorySnapshot> {
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
        instance: AudioItem
    ): InternalError | Valid {
        return instance.validateExternalReferences(snapshot);
    }

    protected buildEvent(command: CreateAudioItem, eventId: string, userId: string): BaseEvent {
        return new AudioItemCreated(command, eventId, userId);
    }
}
