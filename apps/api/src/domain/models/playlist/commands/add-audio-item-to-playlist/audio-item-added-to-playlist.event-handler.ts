import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { IPlaylistQueryRepository, PLAYLIST_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { AudioItemAddedToPlaylist } from './audio-item-added-to-playlist.event';

@CoscradEventConsumer('AUDIO_ITEM_ADDED_TO_PLAYLIST')
export class AudioItemAddedToPlaylistEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(PLAYLIST_QUERY_REPOSITORY_TOKEN)
        private readonly playlistQueryRepository: IPlaylistQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: playlistId },
            audioItemId,
        },
    }: AudioItemAddedToPlaylist): Promise<void> {
        await this.playlistQueryRepository.addAudioItem(playlistId, audioItemId);
    }
}
