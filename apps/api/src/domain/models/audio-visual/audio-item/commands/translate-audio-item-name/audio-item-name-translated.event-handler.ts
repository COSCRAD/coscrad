import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../domain/common';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../queries/audio-item-query-repository.interface';
import { AudioItemNameTranslated } from './audio-item-name-translated-event';

@CoscradEventConsumer('AUDIO_ITEM_NAME_TRANSLATED')
export class AudioItemNameTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IAudioItemQueryRepository
    ) {}

    async handle({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: audioItemId },
        },
    }: AudioItemNameTranslated): Promise<void> {
        await this.queryRepository.translateName(audioItemId, {
            text,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }
}
