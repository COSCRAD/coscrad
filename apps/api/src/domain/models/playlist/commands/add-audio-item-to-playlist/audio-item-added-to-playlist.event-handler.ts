import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IPlaylistQueryRepository } from '../../queries/playlist-query-repository.interface';
import { AudioItemAddedToPlaylist } from './audio-item-added-to-playlist.event';

@CoscradEventConsumer('AUDIO_ITEM_ADDED_TO_PLAYLIST')
export class AudioItemAddedToPlaylistEventHandler implements ICoscradEventHandler {
    private readonly playlistQueryRepository: IPlaylistQueryRepository;

    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        queryRepositoryProvider: IQueryRepositoryProvider
    ) {
        this.playlistQueryRepository = queryRepositoryProvider.forResource(ResourceType.playlist);

        console.log('');
    }

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: playlistId },
            audioItemId,
        },
    }: AudioItemAddedToPlaylist): Promise<void> {
        await this.playlistQueryRepository.addAudioItem(playlistId, audioItemId);
    }
}
