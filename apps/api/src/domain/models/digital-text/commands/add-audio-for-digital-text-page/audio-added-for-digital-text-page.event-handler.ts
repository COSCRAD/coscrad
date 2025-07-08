import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

export class AudioAddedForDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle(_event: AudioAddedForDigitalTextPage): Promise<void> {
        throw new Error('not implemented');
    }
}
