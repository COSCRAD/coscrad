import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    ISongQueryRepository,
    SONG_QUERY_REPOSITORY_TOKEN,
} from '../../queries/song-query-repository.interface';
import { LyricsAddedForSong } from './lyrics-added-for-song.event';

@CoscradEventConsumer('LYRICS_ADDED_FOR_SONG')
export class LyricsAddedForSongEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(SONG_QUERY_REPOSITORY_TOKEN)
        private readonly songQueryRepository: ISongQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            languageCode,
            lyrics,
        },
    }: LyricsAddedForSong): Promise<void> {
        await this.songQueryRepository.addLyrics(id, lyrics, languageCode);
    }
}
