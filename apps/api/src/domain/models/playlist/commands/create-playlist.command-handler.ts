import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../factories/getInstanceFactoryForResource';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
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

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        name,
        languageCodeForName,
    }: CreatePlayList): ResultOrError<Playlist> {
        const createDto: DTO<Playlist> = {
            id,
            type: AggregateType.playlist,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            items: [],
            published: false,
        };

        const newInstanceOrError = getInstanceFactoryForResource<Playlist>(ResourceType.playlist)(
            createDto
        );

        return newInstanceOrError;
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
        const allErrors: InternalError[] = [];

        if (preExistingPlayLists.some(idEquals(instance.id)))
            allErrors.push(
                new ResourceIdAlreadyInUseError({
                    id: instance.id,
                    resourceType: ResourceType.playlist,
                })
            );

        if (
            preExistingPlayLists.some((playlist) =>
                isDeepStrictEqual(
                    instance.name.getOriginalTextItem(),
                    playlist.name.getOriginalTextItem()
                )
            )
        ) {
            allErrors.push(
                new InternalError(
                    `there is already a playlist with the name: ${
                        instance.name.getOriginalTextItem().text
                    }`
                )
            );
        }

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    protected buildEvent(command: CreatePlayList, eventId: string, userId: string): BaseEvent {
        return new playlistCreated(command, eventId, userId);
    }
}
