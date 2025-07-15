import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { AudioAddedForDigitalTextTitle } from './audio-added-for-digital-text-title.event';

@CoscradEventConsumer('AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE')
export class AudioAddedForDigitalTextTitleEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            languageCode,
            audioItemId,
        },
    }: AudioAddedForDigitalTextTitle): Promise<void> {
        await this.queryRepository.addAudioForTitle(digitalTextId, audioItemId, languageCode);
    }
}
