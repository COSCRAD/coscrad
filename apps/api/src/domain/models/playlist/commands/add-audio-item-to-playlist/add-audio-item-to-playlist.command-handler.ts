import { ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../domain/common/events/interfaces';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../domain/repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Playlist } from '../../entities';
import { PlaylistItem } from '../../entities/playlist-item.entity';
import { AddAudioItemToPlaylist } from './add-audio-item-to-playlist.command';
import { AudioItemAddedToPlaylist } from './audio-item-added-to-playlist.event';

@CommandHandler(AddAudioItemToPlaylist)
export class AddAudioItemToPlaylistCommandHandler extends BaseUpdateCommandHandler<Playlist> {
    // TODO do we still need this?
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    protected actOnInstance(
        instance: Playlist,
        { audioItemId }: AddAudioItemToPlaylist
    ): ResultOrError<Playlist> {
        return instance.addItem(
            new PlaylistItem({
                resourceCompositeIdentifier: { type: ResourceType.audioItem, id: audioItemId },
            })
        );
    }

    protected async fetchRequiredExternalState(
        _: AddAudioItemToPlaylist
    ): Promise<InMemorySnapshot> {
        const audioItems = await this.repositoryProvider
            .forResource(ResourceType.audioItem)
            .fetchMany();

        return new DeluxeInMemoryStore({
            audioItem: audioItems.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _snapshot: InMemorySnapshot,
        _instance: Playlist
    ): InternalError | Valid {
        // references to audio items are validated in the base handler via the schema
        return Valid;
    }

    protected buildEvent(
        command: AddAudioItemToPlaylist,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new AudioItemAddedToPlaylist(command, eventMeta);
    }
}
