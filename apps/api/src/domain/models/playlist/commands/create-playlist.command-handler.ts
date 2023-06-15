import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../types/DTO';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { BaseEvent } from '../../shared/events/base-event.entity';
import idEquals from '../../shared/functional/idEquals';
import { Playlist } from '../entities';
import { CreatePlayList } from './create-playlist.command';
import { playlistCreated } from './playlist-created.event';

@CommandHandler(CreatePlayList)
export class CreatePlayListCommandHandler extends BaseCreateCommandHandler<Playlist> {
    protected aggregateType = ResourceType.playlist;

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Playlist>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        // TODO export a constant for ID manager token
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<Playlist>(
            ResourceType.playlist
        );
    }

    protected buildCreateDto({
        aggregateCompositeIdentifier: { id },
        name,
        languageCodeForName,
    }: CreatePlayList): DTO<Playlist> {
        const createDto: DTO<Playlist> = {
            id,
            type: AggregateType.playlist,
            name: new MultilingualText({
                items: [],
            }).append(
                new MultilingualTextItem({
                    text: name,
                    languageCode: languageCodeForName,
                    role: MultilingualTextItemRole.original,
                })
            ),
            items: [],
            published: false,
        };

        return createDto;
    }

    protected async fetchRequiredExternalState(
        _command?: CreatePlayList
    ): Promise<InMemorySnapshot> {
        const searchResults = await this.repositoryProvider
            .forResource<Playlist>(ResourceType.playlist)
            .fetchMany();

        const preExistingPlayLists = searchResults.filter((result): result is Playlist => {
            if (isInternalError(result)) {
                throw new InternalError(`Invalid playlist in database!`, [result]);
            }

            return true;
        });

        return new DeluxeInMemoryStore({
            [AggregateType.playlist]: preExistingPlayLists,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        { resources: { playlist: preExistingPlayLists } }: InMemorySnapshot,
        instance: Playlist
    ): InternalError | Valid {
        if (preExistingPlayLists.some(idEquals(instance.id)))
            return new ResourceIdAlreadyInUseError({
                id: instance.id,
                resourceType: ResourceType.playlist,
            });

        return Valid;
    }

    protected buildEvent(command: CreatePlayList, eventId: string, userId: string): BaseEvent {
        return new playlistCreated(command, eventId, userId);
    }
}
