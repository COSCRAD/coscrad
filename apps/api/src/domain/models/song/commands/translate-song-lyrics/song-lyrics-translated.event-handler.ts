import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    ISongQueryRepository,
    SONG_QUERY_REPOSITORY_TOKEN,
} from '../../queries/song-query-repository.interface';
import { SongLyricsTranslated } from './song-lyrics-translated.event';

@CoscradEventConsumer('SONG_LYRICS_TRANSLATED')
export class SongLyricsTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(SONG_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: ISongQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: songId },
            translation,
            languageCode,
        },
    }: SongLyricsTranslated): Promise<void> {
        await this.queryRepository.translateLyrics(songId, {
            text: translation,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }
}
