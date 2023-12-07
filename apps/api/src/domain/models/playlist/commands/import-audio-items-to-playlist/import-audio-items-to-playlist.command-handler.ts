import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Playlist } from '../../entities';
import { PlaylistItem } from '../../entities/playlist-item.entity';
import { AudioItemsImportedToPlaylist } from './audio-items-imported-to-playlist.event';
import { ImportAudioItemsToPlaylist } from './import-audio-items-to-playlist.command';

@CommandHandler(ImportAudioItemsToPlaylist)
export class ImportAudioItemsToPlaylistCommandHandler extends BaseUpdateCommandHandler<Playlist> {
    protected async fetchRequiredExternalState(
        _: ImportAudioItemsToPlaylist
    ): Promise<InMemorySnapshot> {
        const audioItems = await this.repositoryProvider
            .forResource(ResourceType.audioItem)
            .fetchMany();

        return new DeluxeInMemoryStore({
            audioItem: audioItems.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Playlist
    ): InternalError | Valid {
        // References to audio items are validated via the schema in the base handler
        return Valid;
    }

    protected actOnInstance(
        playlist: Playlist,
        { audioItemIds }: ImportAudioItemsToPlaylist
    ): ResultOrError<Playlist> {
        return playlist.addItems(
            audioItemIds.map(
                (id) =>
                    new PlaylistItem({
                        resourceCompositeIdentifier: { type: ResourceType.audioItem, id },
                    })
            )
        );
    }

    protected buildEvent(
        command: ImportAudioItemsToPlaylist,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new AudioItemsImportedToPlaylist(command, eventMeta);
    }
}
