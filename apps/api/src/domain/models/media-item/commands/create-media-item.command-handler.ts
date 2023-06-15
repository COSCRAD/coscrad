import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import idEquals from '../../shared/functional/idEquals';
import { MediaItem } from '../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';
import { MediaItemCreated } from './media-item-created.event';

@CommandHandler(CreateMediaItem)
export class CreateMediaItemCommandHandler extends BaseCreateCommandHandler<MediaItem> {
    protected aggregateType = ResourceType.mediaItem;

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<MediaItem>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<MediaItem>(
            ResourceType.mediaItem
        );
    }

    protected buildCreateDto(command: CreateMediaItem): DTO<MediaItem> {
        const {
            aggregateCompositeIdentifier: { id },
            title,
            titleEnglish,
            url,
            mimeType,
        } = command;

        const createDto: DTO<MediaItem> = {
            id,
            type: ResourceType.mediaItem,
            title,
            titleEnglish,
            url,
            mimeType: mimeType,
            // You must execute `PUBLISH_MEDIA_ITEM` to publish
            published: false,
            // The actual length must be registered via a subsequent command
            lengthMilliseconds: 0,
        };

        return createDto;
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResults = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany();

        const preExistingMediaItems = searchResults.filter((result): result is MediaItem => {
            if (isInternalError(result)) {
                throw new InternalError(`Invalid media item in database!`, [result]);
            }

            return true;
        });

        return buildInMemorySnapshot({
            resources: {
                mediaItem: preExistingMediaItems,
            },
        });
    }

    protected validateExternalState(
        { resources: { mediaItem: preExistingMediaItems } }: InMemorySnapshot,
        instance: MediaItem
    ): InternalError | Valid {
        if (preExistingMediaItems.some(idEquals(instance.id)))
            return new ResourceIdAlreadyInUseError({
                id: instance.id,
                resourceType: ResourceType.mediaItem,
            });

        return Valid;
    }

    protected buildEvent(command: CreateMediaItem, eventId: AggregateId, userId: AggregateId) {
        return new MediaItemCreated(command, eventId, userId);
    }
}
