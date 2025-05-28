import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    ISongQueryRepository,
    SONG_QUERY_REPOSITORY_TOKEN,
} from '../../queries/song-query-repository.interface';
import { SongTitleTranslated } from './song-title-translated.event';

export class SongTitleTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(SONG_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: ISongQueryRepository
    ) {}

    async handle({
        payload: {
            translation,
            languageCode,
            aggregateCompositeIdentifier: { id: audioItemId },
        },
    }: SongTitleTranslated): Promise<void> {
        await this.queryRepository.translateName(audioItemId, {
            text: translation,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }
}
