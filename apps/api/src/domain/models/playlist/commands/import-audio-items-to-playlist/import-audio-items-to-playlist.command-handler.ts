import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { Playlist } from '../../entities';
import { PlaylistItem } from '../../entities/playlist-item.entity';
import { importAudioItemsToPlaylist } from './import-audio-items-to-playlist.command';

@CommandHandler(importAudioItemsToPlaylist)
export class importAudioItemsToPlaylistCommandHandler extends BaseUpdateCommandHandler<Playlist> {
    protected fetchRequiredExternalState(_: importAudioItemsToPlaylist): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Playlist
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        playlist: Playlist,
        { audioItemIds, aggregateCompositeIdentifier }: importAudioItemsToPlaylist
    ): ResultOrError<Playlist> {
        return playlist.addItem(
            new PlaylistItem({
                resourceCompositeIdentifier: { type: ResourceType.audioItem, id: audioItemIds },
            })
        );
    }
}
