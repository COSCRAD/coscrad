import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IPlaylistQueryRepository,
    PLAYLIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries/playlist-query-repository.interface';
import { AudioItemsImportedToPlaylist } from './audio-items-imported-to-playlist.event';

@CoscradEventConsumer('AUDIO_ITEMS_IMPORTED_TO_PLAYLIST')
export class AudioItemsImportedToPlaylistEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(PLAYLIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IPlaylistQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            audioItemIds,
        },
    }: AudioItemsImportedToPlaylist): Promise<void> {
        await this.queryRepository.importAudioItems(id, audioItemIds);
    }
}
