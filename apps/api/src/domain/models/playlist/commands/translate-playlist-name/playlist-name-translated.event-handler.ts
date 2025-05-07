import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IPlaylistQueryRepository,
    PLAYLIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries/playlist-query-repository.interface';
import { PlaylistNameTranslated } from './playlist-name-translated.event';

@CoscradEventConsumer('PLAYLIST_NAME_TRANSLATED')
export class PlaylistNameTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(PLAYLIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IPlaylistQueryRepository
    ) {}

    async handle({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: playlistId },
        },
    }: PlaylistNameTranslated): Promise<void> {
        await this.queryRepository.translatePlaylistName(playlistId, text, languageCode);
    }
}
