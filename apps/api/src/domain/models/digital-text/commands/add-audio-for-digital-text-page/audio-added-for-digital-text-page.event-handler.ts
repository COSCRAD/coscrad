import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

@CoscradEventConsumer('AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE')
export class AudioAddedForDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            languageCode,
            audioItemId,
            pageIdentifier,
        },
    }: AudioAddedForDigitalTextPage): Promise<void> {
        await this.queryRepository.addAudioToPage(
            digitalTextId,
            pageIdentifier,
            audioItemId,
            languageCode
        );
    }
}
